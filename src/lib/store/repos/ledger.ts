"use client";
import { LedgerEntry, StockSnapshot } from "../types";
import { read, write } from "../storage";

const LEDGER_KEY = "ledger" as const;
const STOCK_KEY = "stock" as const;

export function listLedger(): LedgerEntry[] {
  return read<LedgerEntry[]>(LEDGER_KEY, []);
}

export function ledgerForUnit(productUnitId: string): LedgerEntry[] {
  return listLedger().filter((e) => e.productUnitId === productUnitId);
}

export function appendLedger(entries: LedgerEntry[]): void {
  const all = listLedger();
  write(LEDGER_KEY, [...all, ...entries]);
}

export function replaceAllLedger(entries: LedgerEntry[]): void {
  write(LEDGER_KEY, entries);
}

export function listStockSnapshots(): StockSnapshot[] {
  return read<StockSnapshot[]>(STOCK_KEY, []);
}

export function getStockOf(productUnitId: string): number {
  return (
    listStockSnapshots().find((s) => s.productUnitId === productUnitId)
      ?.onHand ?? 0
  );
}

export function replaceAllStock(snapshots: StockSnapshot[]): void {
  write(STOCK_KEY, snapshots);
}

export function applyDelta(
  productUnitId: string,
  delta: number,
  at = new Date().toISOString(),
): StockSnapshot[] {
  const all = listStockSnapshots();
  const i = all.findIndex((s) => s.productUnitId === productUnitId);
  if (i === -1) {
    all.push({
      productUnitId,
      onHand: delta,
      lastMovementAt: at,
    });
  } else {
    all[i] = {
      ...all[i],
      onHand: all[i].onHand + delta,
      lastMovementAt: at,
    };
  }
  write(STOCK_KEY, all);
  return all;
}

/**
 * Rebuild the stock cache by replaying the entire ledger.
 * Useful for recovery + initial seed.
 */
export function rebuildStockFromLedger(): StockSnapshot[] {
  const byUnit = new Map<string, { onHand: number; lastMovementAt: string }>();
  for (const e of listLedger()) {
    const cur = byUnit.get(e.productUnitId) ?? {
      onHand: 0,
      lastMovementAt: e.occurredAt,
    };
    cur.onHand += e.delta;
    if (e.occurredAt > cur.lastMovementAt) cur.lastMovementAt = e.occurredAt;
    byUnit.set(e.productUnitId, cur);
  }
  const snapshots: StockSnapshot[] = Array.from(byUnit.entries()).map(
    ([productUnitId, v]) => ({
      productUnitId,
      onHand: v.onHand,
      lastMovementAt: v.lastMovementAt,
    }),
  );
  write(STOCK_KEY, snapshots);
  return snapshots;
}
