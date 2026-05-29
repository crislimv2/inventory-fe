"use client";
import { Settings } from "../types";
import { read, write } from "../storage";

const KEY = "settings" as const;

export const DEFAULT_SETTINGS: Settings = {
  merchant: {
    name: "Toko Ci Ali",
    address: "Jl. Jelambar Jaya 4 No. 18, Grogol Petamburan, Jakarta Barat",
    phone: "",
    taxId: "",
  },
  currency: "IDR",
  locale: "id-ID",
  lowStockThreshold: 5,
  demoSeedVersion: 1,
};

export function getSettings(): Settings {
  return read<Settings>(KEY, DEFAULT_SETTINGS);
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const current = getSettings();
  const next: Settings = {
    ...current,
    ...patch,
    merchant: { ...current.merchant, ...(patch.merchant ?? {}) },
  };
  write(KEY, next);
  return next;
}

export function replaceSettings(settings: Settings): void {
  write(KEY, settings);
}
