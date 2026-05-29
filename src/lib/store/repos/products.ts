"use client";
import { Product } from "../types";
import { read, write } from "../storage";

const KEY = "products" as const;

export function listProducts(includeArchived = false): Product[] {
  const all = read<Product[]>(KEY, []);
  return includeArchived ? all : all.filter((p) => !p.archivedAt);
}

export function getProduct(id: string): Product | undefined {
  return read<Product[]>(KEY, []).find((p) => p.id === id);
}

export function upsertProduct(p: Product): void {
  const all = read<Product[]>(KEY, []);
  const i = all.findIndex((x) => x.id === p.id);
  const stamped = { ...p, updatedAt: new Date().toISOString() };
  if (i === -1) all.push(stamped);
  else all[i] = stamped;
  write(KEY, all);
}

export function archiveProduct(
  id: string,
  at = new Date().toISOString(),
): void {
  const all = read<Product[]>(KEY, []).map((p) =>
    p.id === id ? { ...p, archivedAt: at } : p,
  );
  write(KEY, all);
}

export function unarchiveProduct(id: string): void {
  const all = read<Product[]>(KEY, []).map((p) =>
    p.id === id ? { ...p, archivedAt: undefined } : p,
  );
  write(KEY, all);
}

export function replaceAllProducts(products: Product[]): void {
  write(KEY, products);
}
