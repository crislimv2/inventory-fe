"use client";
import { read, write } from "./storage";

const CURRENT_VERSION = 1;

export interface Meta {
  version: number;
  seededAt?: string;
}

interface Migration {
  to: number;
  apply: () => void;
}

const migrations: Migration[] = [];

export function getMeta(): Meta {
  return read<Meta>("meta", { version: 0 });
}

export function setMeta(meta: Meta): void {
  write<Meta>("meta", meta);
}

export function runMigrations(): void {
  const meta = getMeta();
  let v = meta.version;
  for (const m of migrations) {
    if (m.to > v) {
      m.apply();
      v = m.to;
    }
  }
  if (v === 0) v = CURRENT_VERSION;
  if (v !== meta.version) setMeta({ ...meta, version: v });
}
