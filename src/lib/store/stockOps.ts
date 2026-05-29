"use client";
import { LedgerEntry, LedgerReason, newId } from "./types";
import {
  appendLedger,
  applyDelta,
  listLedger,
  rebuildStockFromLedger,
} from "./repos/ledger";

export interface MovementInput {
  productUnitId: string;
  delta: number;
  reason: LedgerReason;
  note?: string;
  occurredAt?: string;
  refType?: LedgerEntry["refType"];
  refId?: string;
  createdBy?: string;
}

/**
 * Append a ledger entry and update stock snapshot.
 * Returns the created entry.
 */
export function recordMovement(input: MovementInput): LedgerEntry {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const createdAt = new Date().toISOString();
  const entry: LedgerEntry = {
    id: newId("le_"),
    productUnitId: input.productUnitId,
    delta: input.delta,
    reason: input.reason,
    refType: input.refType,
    refId: input.refId,
    note: input.note,
    occurredAt,
    createdAt,
    createdBy: input.createdBy,
  };
  appendLedger([entry]);
  applyDelta(input.productUnitId, input.delta, occurredAt);
  return entry;
}

export function recordPurchase(
  inputs: Omit<MovementInput, "reason">[],
  note?: string,
): LedgerEntry[] {
  const refId = newId("purch_");
  return inputs.map((i) =>
    recordMovement({
      ...i,
      reason: "purchase",
      refType: "purchase",
      refId,
      note: i.note ?? note,
    }),
  );
}

export function recordAudit(
  inputs: Omit<MovementInput, "reason">[],
  note?: string,
): LedgerEntry[] {
  const refId = newId("audit_");
  return inputs.map((i) =>
    recordMovement({
      ...i,
      reason: "audit",
      refType: "audit",
      refId,
      note: i.note ?? note,
    }),
  );
}

export { listLedger, rebuildStockFromLedger };
