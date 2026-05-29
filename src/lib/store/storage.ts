"use client";

const KEY_PREFIX = "pos:v1:";

export type StorageKey =
  | "products"
  | "units"
  | "stock"
  | "ledger"
  | "transactions"
  | "lines"
  | "holds"
  | "audits"
  | "settings"
  | "meta";

const fullKey = (key: StorageKey) => KEY_PREFIX + key;

const cache: Partial<Record<StorageKey, unknown>> = {};

export function read<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache[key] !== undefined) return cache[key] as T;
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as T;
    cache[key] = parsed;
    return parsed;
  } catch {
    return fallback;
  }
}

export function write<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;
  cache[key] = value;
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
  } catch (e) {
    console.error("storage write failed", key, e);
    throw e;
  }
}

export function writeMany(
  updates: Partial<Record<StorageKey, unknown>>,
): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(updates) as StorageKey[];
  const snapshot: Partial<Record<StorageKey, unknown>> = {};
  for (const key of keys) snapshot[key] = cache[key];

  try {
    for (const key of keys) {
      cache[key] = updates[key];
      window.localStorage.setItem(fullKey(key), JSON.stringify(updates[key]));
    }
  } catch (e) {
    for (const key of keys) {
      cache[key] = snapshot[key];
      if (snapshot[key] === undefined) {
        window.localStorage.removeItem(fullKey(key));
      } else {
        window.localStorage.setItem(
          fullKey(key),
          JSON.stringify(snapshot[key]),
        );
      }
    }
    throw e;
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.keys(cache) as StorageKey[]) delete cache[key];
  const remove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(KEY_PREFIX)) remove.push(k);
  }
  remove.forEach((k) => window.localStorage.removeItem(k));
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
