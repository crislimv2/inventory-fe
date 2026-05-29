"use client";
import { ProductUnit } from "../types";
import { read, write } from "../storage";

const KEY = "units" as const;

export function listUnits(): ProductUnit[] {
  return read<ProductUnit[]>(KEY, []);
}

export function unitsByProduct(productId: string): ProductUnit[] {
  return listUnits().filter((u) => u.productId === productId);
}

export function getUnit(id: string): ProductUnit | undefined {
  return listUnits().find((u) => u.id === id);
}

export function upsertUnit(u: ProductUnit): void {
  const all = listUnits();
  const i = all.findIndex((x) => x.id === u.id);
  if (i === -1) all.push(u);
  else all[i] = u;
  write(KEY, all);
}

export function upsertManyUnits(units: ProductUnit[]): void {
  const all = listUnits();
  const idx = new Map(all.map((u, i) => [u.id, i]));
  for (const u of units) {
    const i = idx.get(u.id);
    if (i === undefined) all.push(u);
    else all[i] = u;
  }
  write(KEY, all);
}

export function deleteUnit(id: string): void {
  write(
    KEY,
    listUnits().filter((u) => u.id !== id),
  );
}

export function replaceAllUnits(units: ProductUnit[]): void {
  write(KEY, units);
}
