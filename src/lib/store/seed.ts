"use client";
import {
  LedgerEntry,
  PaymentMethod,
  Product,
  ProductUnit,
  StockSnapshot,
  Transaction,
  TransactionLine,
  newId,
  transactionCode,
} from "./types";
import { writeMany } from "./storage";
import { getMeta, setMeta } from "./migrations";
import { DEFAULT_SETTINGS } from "./repos/settings";
import { dummyData } from "../../../components/interfaces/Product";

const SEED_VERSION = 1;

const UNIT_RATIOS: Record<string, { ratio: number; isBase: boolean }> = {
  pcs: { ratio: 1, isBase: true },
  pc: { ratio: 1, isBase: true },
  sachet: { ratio: 1, isBase: true },
  botol: { ratio: 1, isBase: true },
  batang: { ratio: 1, isBase: true },
  lembar: { ratio: 1, isBase: true },
  biji: { ratio: 1, isBase: true },
  kaleng: { ratio: 1, isBase: true },
  pack: { ratio: 10, isBase: false },
  pak: { ratio: 10, isBase: false },
  renteng: { ratio: 12, isBase: false },
  box: { ratio: 24, isBase: false },
  dus: { ratio: 48, isBase: false },
  karton: { ratio: 48, isBase: false },
  lusin: { ratio: 12, isBase: false },
  kg: { ratio: 1, isBase: true },
  "1/2 kg": { ratio: 0.5, isBase: false },
  "1/4 kg": { ratio: 0.25, isBase: false },
  "1/8 kg": { ratio: 0.125, isBase: false },
};

function classifyUnit(name: string): { ratio: number; isBase: boolean } {
  const n = name.toLowerCase();
  if (UNIT_RATIOS[n]) return UNIT_RATIOS[n];
  for (const key of Object.keys(UNIT_RATIOS)) {
    if (n.includes(key)) return UNIT_RATIOS[key];
  }
  return { ratio: 1, isBase: true };
}

interface SeedOutput {
  products: Product[];
  units: ProductUnit[];
  ledger: LedgerEntry[];
  stock: StockSnapshot[];
  transactions: Transaction[];
  lines: TransactionLine[];
}

function buildCatalog(): { products: Product[]; units: ProductUnit[] } {
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() - 14);
  const baseIso = baseDate.toISOString();

  const products: Product[] = [];
  const units: ProductUnit[] = [];

  for (const raw of dummyData) {
    const product: Product = {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      category: raw.category ?? "Lainnya",
      createdAt: baseIso,
      updatedAt: baseIso,
    };
    products.push(product);

    const rawUnits = raw.units ?? [];
    const productUnits: ProductUnit[] =
      rawUnits.length > 0
        ? rawUnits.map((u) => {
            const c = classifyUnit(u.unitName);
            return {
              id: u.id,
              productId: raw.id,
              unitName: u.unitName,
              price: u.price,
              costPrice: Math.round(u.price * 0.7),
              conversionToBase: c.ratio,
              isBase: c.isBase,
            };
          })
        : [
            {
              id: newId("u_"),
              productId: raw.id,
              unitName: "Pcs",
              price: 5000,
              costPrice: 3500,
              conversionToBase: 1,
              isBase: true,
            },
          ];
    units.push(...productUnits);
  }

  return { products, units };
}

function rng(seed: { v: number }): number {
  seed.v = (seed.v * 16807) % 2147483647;
  return (seed.v - 1) / 2147483646;
}

function pickWeighted<T>(items: T[], weights: number[], r: number): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let cum = 0;
  const target = r * total;
  for (let i = 0; i < items.length; i++) {
    cum += weights[i];
    if (target < cum) return items[i];
  }
  return items[items.length - 1];
}

function generateTransactions(
  products: Product[],
  units: ProductUnit[],
): { transactions: Transaction[]; lines: TransactionLine[] } {
  const transactions: Transaction[] = [];
  const lines: TransactionLine[] = [];
  const sellableUnits = units.filter((u) => u.price > 0);
  if (sellableUnits.length === 0) return { transactions, lines };

  const productById = new Map(products.map((p) => [p.id, p]));
  const seed = { v: 20250101 };

  const now = new Date();
  const dailySequence = new Map<string, number>();

  for (let dayOffset = 395; dayOffset >= 0; dayOffset--) {
    const day = new Date(now);
    day.setDate(day.getDate() - dayOffset);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isFriday = dow === 5;

    const baseRate = isWeekend ? 5 : isFriday ? 4 : 2;
    const txCount = Math.max(0, Math.round(baseRate + (rng(seed) - 0.5) * 3));

    for (let t = 0; t < txCount; t++) {
      // Time-of-day weighted to 10am-9pm
      const hourWeights = [
        0, 0, 0, 0, 0, 0.2, 0.5, 0.8, 1.2, 1.6, 2, 2.4, 2.6, 2.2, 1.8, 1.6, 1.8,
        2.2, 2.6, 2.4, 1.8, 0.8, 0.3, 0.1,
      ];
      const hour = Math.max(
        0,
        Math.min(
          23,
          Math.round(
            pickWeighted(
              hourWeights.map((_, i) => i),
              hourWeights,
              rng(seed),
            ),
          ),
        ),
      );
      const minute = Math.floor(rng(seed) * 60);
      const txDate = new Date(day);
      txDate.setHours(hour, minute, Math.floor(rng(seed) * 60), 0);

      // 1-5 lines per transaction
      const lineCount = 1 + Math.floor(rng(seed) * 5);
      const chosenUnitIds = new Set<string>();
      const txLines: TransactionLine[] = [];
      const txId = newId("tx_");
      let subtotal = 0;

      for (let l = 0; l < lineCount; l++) {
        const unit =
          sellableUnits[Math.floor(rng(seed) * sellableUnits.length)];
        if (chosenUnitIds.has(unit.id)) continue;
        chosenUnitIds.add(unit.id);

        // Higher qty for cheap base units, low qty for big units
        const qty =
          unit.price < 5000
            ? 1 + Math.floor(rng(seed) * 4)
            : unit.price < 20000
              ? 1 + Math.floor(rng(seed) * 2)
              : 1;
        const product = productById.get(unit.productId);
        if (!product) continue;
        const lineTotal = unit.price * qty;
        subtotal += lineTotal;

        txLines.push({
          id: newId("ln_"),
          transactionId: txId,
          productId: product.id,
          productUnitId: unit.id,
          productName: product.name,
          unitName: unit.unitName,
          price: unit.price,
          quantity: qty,
          lineTotal,
        });
      }

      if (txLines.length === 0) continue;

      // Payment method distribution
      const r = rng(seed);
      const paymentMethod: PaymentMethod =
        r < 0.6 ? "cash" : r < 0.9 ? "qris" : "debit";

      const dayKey = txDate.toISOString().slice(0, 10);
      const seq = (dailySequence.get(dayKey) ?? 0) + 1;
      dailySequence.set(dayKey, seq);

      const cashTendered =
        paymentMethod === "cash"
          ? Math.ceil(subtotal / 1000) * 1000 +
            Math.floor(rng(seed) * 2) * 10000
          : undefined;

      const tx: Transaction = {
        id: txId,
        code: transactionCode(txDate, seq),
        status: "paid",
        paymentMethod,
        subtotal,
        discount: 0,
        total: subtotal,
        cashTendered,
        change: cashTendered ? cashTendered - subtotal : undefined,
        occurredAt: txDate.toISOString(),
      };
      transactions.push(tx);
      lines.push(...txLines);
    }
  }

  return { transactions, lines };
}

function buildLedgerAndStock(
  units: ProductUnit[],
  transactions: Transaction[],
  lines: TransactionLine[],
): { ledger: LedgerEntry[]; stock: StockSnapshot[] } {
  const ledger: LedgerEntry[] = [];
  const openingDate = new Date();
  openingDate.setMonth(openingDate.getMonth() - 14);
  const openingIso = openingDate.toISOString();
  const createdAt = new Date().toISOString();

  // Tally total qty sold per unit to pre-stock.
  const soldByUnit = new Map<string, number>();
  for (const line of lines) {
    soldByUnit.set(
      line.productUnitId,
      (soldByUnit.get(line.productUnitId) ?? 0) + line.quantity,
    );
  }

  // Opening + replenishment purchase entries so stock stays positive.
  for (const unit of units) {
    const sold = soldByUnit.get(unit.id) ?? 0;
    const buffer = Math.max(20, Math.ceil(sold * 0.35));
    const opening = sold + buffer;
    ledger.push({
      id: newId("le_"),
      productUnitId: unit.id,
      delta: opening,
      reason: "opening",
      occurredAt: openingIso,
      createdAt,
      note: "Opening balance",
    });
  }

  // Sale entries for each transaction line.
  const txById = new Map(transactions.map((t) => [t.id, t]));
  for (const line of lines) {
    const tx = txById.get(line.transactionId);
    if (!tx) continue;
    ledger.push({
      id: newId("le_"),
      productUnitId: line.productUnitId,
      delta: -line.quantity,
      reason: "sale",
      refType: "transaction",
      refId: tx.id,
      occurredAt: tx.occurredAt,
      createdAt,
    });
  }

  // Compute stock snapshot from ledger.
  const byUnit = new Map<string, { onHand: number; lastMovementAt: string }>();
  for (const e of ledger) {
    const cur = byUnit.get(e.productUnitId) ?? {
      onHand: 0,
      lastMovementAt: e.occurredAt,
    };
    cur.onHand += e.delta;
    if (e.occurredAt > cur.lastMovementAt) cur.lastMovementAt = e.occurredAt;
    byUnit.set(e.productUnitId, cur);
  }
  const stock: StockSnapshot[] = Array.from(byUnit.entries()).map(
    ([productUnitId, v]) => ({
      productUnitId,
      onHand: v.onHand,
      lastMovementAt: v.lastMovementAt,
    }),
  );

  return { ledger, stock };
}

function buildSeed(): SeedOutput {
  const { products, units } = buildCatalog();
  const { transactions, lines } = generateTransactions(products, units);
  const { ledger, stock } = buildLedgerAndStock(units, transactions, lines);
  return { products, units, transactions, lines, ledger, stock };
}

/**
 * Ensure seed data exists. Runs once per `demoSeedVersion`.
 * Pass `force: true` to wipe and reseed regardless.
 */
export function ensureSeed(force = false): SeedOutput | null {
  if (typeof window === "undefined") return null;
  const meta = getMeta();
  if (!force && meta.seededAt) return null;

  const out = buildSeed();
  writeMany({
    products: out.products,
    units: out.units,
    transactions: out.transactions,
    lines: out.lines,
    ledger: out.ledger,
    stock: out.stock,
    settings: DEFAULT_SETTINGS,
  });
  setMeta({
    ...meta,
    version: Math.max(meta.version, 1),
    seededAt: new Date().toISOString(),
  });
  return out;
}

export const SEED_META = { version: SEED_VERSION };
