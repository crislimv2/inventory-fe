"use client";
import { AuditSession } from "../types";
import { read, write } from "../storage";

const KEY = "audits" as const;

export function listAudits(): AuditSession[] {
  return read<AuditSession[]>(KEY, []);
}

export function getAudit(id: string): AuditSession | undefined {
  return listAudits().find((a) => a.id === id);
}

export function upsertAudit(audit: AuditSession): void {
  const all = listAudits();
  const i = all.findIndex((a) => a.id === audit.id);
  if (i === -1) all.unshift(audit);
  else all[i] = audit;
  write(KEY, all);
}

export function deleteAudit(id: string): void {
  write(
    KEY,
    listAudits().filter((a) => a.id !== id),
  );
}
