"use client";
import { CartLine, Hold, HoldLine, newId } from "../types";
import { read, write } from "../storage";

const KEY = "holds" as const;

export function listHolds(): Hold[] {
  return read<Hold[]>(KEY, []);
}

export function holdCart(label: string, cart: CartLine[]): Hold {
  const lines: HoldLine[] = cart.map((c) => ({
    productId: c.productId,
    productUnitId: c.productUnitId,
    productName: c.productName,
    unitName: c.unitName,
    price: c.price,
    quantity: c.quantity,
  }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const hold: Hold = {
    id: newId("hold_"),
    label,
    lines,
    subtotal,
    itemCount,
    createdAt: new Date().toISOString(),
  };
  write(KEY, [hold, ...listHolds()]);
  return hold;
}

export function deleteHold(id: string): void {
  write(
    KEY,
    listHolds().filter((h) => h.id !== id),
  );
}

export function renameHold(id: string, label: string): void {
  write(
    KEY,
    listHolds().map((h) => (h.id === id ? { ...h, label } : h)),
  );
}

export function getHold(id: string): Hold | undefined {
  return listHolds().find((h) => h.id === id);
}

export function replaceAllHolds(holds: Hold[]): void {
  write(KEY, holds);
}
