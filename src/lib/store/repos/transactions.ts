"use client";
import {
  CartLine,
  LedgerEntry,
  PaymentMethod,
  StockSnapshot,
  Transaction,
  TransactionLine,
  newId,
  transactionCode,
} from "../types";
import { read, writeMany } from "../storage";
import { listStockSnapshots } from "./ledger";

const TX_KEY = "transactions" as const;
const LINE_KEY = "lines" as const;
const LEDGER_KEY = "ledger" as const;
const STOCK_KEY = "stock" as const;

export function listTransactions(): Transaction[] {
  return read<Transaction[]>(TX_KEY, []);
}

export function getTransaction(id: string): Transaction | undefined {
  return listTransactions().find((t) => t.id === id);
}

export function listLines(): TransactionLine[] {
  return read<TransactionLine[]>(LINE_KEY, []);
}

export function linesOf(transactionId: string): TransactionLine[] {
  return listLines().filter((l) => l.transactionId === transactionId);
}

export function nextSequenceFor(date: Date): number {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const prefix = `TRX-${y}${m}${d}-`;
  const sameDay = listTransactions().filter((t) => t.code.startsWith(prefix));
  return sameDay.length + 1;
}

export interface CreateSaleInput {
  lines: CartLine[];
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  discount?: number;
  customerName?: string;
  occurredAt?: string;
}

export interface CreateSaleResult {
  transaction: Transaction;
  lines: TransactionLine[];
}

/**
 * Commit a sale atomically: build transaction + lines + ledger entries,
 * decrement stock, write all four slices in a single batched write.
 */
export function commitSale(input: CreateSaleInput): CreateSaleResult {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const occurredAtDate = new Date(occurredAt);
  const txId = newId("tx_");
  const subtotal = input.lines.reduce(
    (s, l) => s + l.price * l.quantity,
    0,
  );
  const discount = input.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const change =
    input.paymentMethod === "cash" && input.cashTendered != null
      ? Math.max(0, input.cashTendered - total)
      : undefined;

  const transaction: Transaction = {
    id: txId,
    code: transactionCode(occurredAtDate, nextSequenceFor(occurredAtDate)),
    status: "paid",
    paymentMethod: input.paymentMethod,
    subtotal,
    discount,
    total,
    cashTendered: input.cashTendered,
    change,
    customerName: input.customerName,
    occurredAt,
  };

  const txLines: TransactionLine[] = input.lines.map((l) => ({
    id: newId("ln_"),
    transactionId: txId,
    productId: l.productId,
    productUnitId: l.productUnitId,
    productName: l.productName,
    unitName: l.unitName,
    price: l.price,
    quantity: l.quantity,
    lineTotal: l.price * l.quantity,
  }));

  const ledgerEntries: LedgerEntry[] = input.lines.map((l) => ({
    id: newId("le_"),
    productUnitId: l.productUnitId,
    delta: -l.quantity,
    reason: "sale",
    refType: "transaction",
    refId: txId,
    occurredAt,
    createdAt: new Date().toISOString(),
  }));

  // Update stock cache.
  const stock = applyDeltasToSnapshots(
    listStockSnapshots(),
    input.lines.map((l) => ({
      productUnitId: l.productUnitId,
      delta: -l.quantity,
    })),
    occurredAt,
  );

  writeMany({
    [TX_KEY]: [...listTransactions(), transaction],
    [LINE_KEY]: [...listLines(), ...txLines],
    [LEDGER_KEY]: [...read<LedgerEntry[]>(LEDGER_KEY, []), ...ledgerEntries],
    [STOCK_KEY]: stock,
  });

  return { transaction, lines: txLines };
}

export interface RefundInput {
  originalId: string;
  // For each transaction line id, how many units to refund.
  refundQuantities: Record<string, number>;
  occurredAt?: string;
}

export function commitRefund(input: RefundInput): CreateSaleResult {
  const original = getTransaction(input.originalId);
  if (!original) throw new Error("Transaksi asli tidak ditemukan");
  const origLines = linesOf(input.originalId);
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const occurredAtDate = new Date(occurredAt);
  const txId = newId("tx_");

  const refundLines: TransactionLine[] = [];
  const ledgerEntries: LedgerEntry[] = [];
  let subtotal = 0;

  for (const ol of origLines) {
    const qty = input.refundQuantities[ol.id] ?? 0;
    if (qty <= 0) continue;
    const lineTotal = ol.price * qty;
    subtotal += lineTotal;
    refundLines.push({
      id: newId("ln_"),
      transactionId: txId,
      productId: ol.productId,
      productUnitId: ol.productUnitId,
      productName: ol.productName,
      unitName: ol.unitName,
      price: ol.price,
      quantity: -qty,
      lineTotal: -lineTotal,
    });
    ledgerEntries.push({
      id: newId("le_"),
      productUnitId: ol.productUnitId,
      delta: qty,
      reason: "refund",
      refType: "transaction",
      refId: txId,
      occurredAt,
      createdAt: new Date().toISOString(),
    });
  }

  if (refundLines.length === 0) {
    throw new Error("Tidak ada item yang dipilih untuk refund");
  }

  const transaction: Transaction = {
    id: txId,
    code: transactionCode(occurredAtDate, nextSequenceFor(occurredAtDate)),
    status: "refunded",
    paymentMethod: original.paymentMethod,
    subtotal: -subtotal,
    discount: 0,
    total: -subtotal,
    occurredAt,
    refundOfId: original.id,
  };

  // Compute new status for the original.
  const refundedQty = refundLines.reduce(
    (s, l) => s + Math.abs(l.quantity),
    0,
  );
  const originalTotalQty = origLines.reduce((s, l) => s + l.quantity, 0);
  const newStatus: Transaction["status"] =
    refundedQty >= originalTotalQty ? "refunded" : "partially_refunded";

  const updatedTransactions = listTransactions().map((t) =>
    t.id === original.id ? { ...t, status: newStatus } : t,
  );

  const stock = applyDeltasToSnapshots(
    listStockSnapshots(),
    refundLines.map((l) => ({
      productUnitId: l.productUnitId,
      delta: Math.abs(l.quantity),
    })),
    occurredAt,
  );

  writeMany({
    [TX_KEY]: [...updatedTransactions, transaction],
    [LINE_KEY]: [...listLines(), ...refundLines],
    [LEDGER_KEY]: [...read<LedgerEntry[]>(LEDGER_KEY, []), ...ledgerEntries],
    [STOCK_KEY]: stock,
  });

  return { transaction, lines: refundLines };
}

export function replaceAllTransactions(
  transactions: Transaction[],
  lines: TransactionLine[],
): void {
  writeMany({
    [TX_KEY]: transactions,
    [LINE_KEY]: lines,
  });
}

function applyDeltasToSnapshots(
  current: StockSnapshot[],
  deltas: { productUnitId: string; delta: number }[],
  occurredAt: string,
): StockSnapshot[] {
  const map = new Map(current.map((s) => [s.productUnitId, { ...s }]));
  for (const { productUnitId, delta } of deltas) {
    const existing = map.get(productUnitId);
    if (existing) {
      existing.onHand += delta;
      existing.lastMovementAt = occurredAt;
    } else {
      map.set(productUnitId, {
        productUnitId,
        onHand: delta,
        lastMovementAt: occurredAt,
      });
    }
  }
  return Array.from(map.values());
}
