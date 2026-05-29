"use client";
import { create } from "zustand";
import * as productsRepo from "./repos/products";
import * as unitsRepo from "./repos/units";
import * as ledgerRepo from "./repos/ledger";
import * as holdsRepo from "./repos/holds";
import * as settingsRepo from "./repos/settings";
import { DEFAULT_SETTINGS } from "./repos/settings";
import { ensureSeed } from "./seed";
import { runMigrations } from "./migrations";
import { clearAll } from "./storage";
import {
  CartLine,
  Hold,
  Product,
  ProductUnit,
  Settings,
  StockSnapshot,
} from "./types";

interface PosState {
  hydrated: boolean;
  products: Product[];
  units: ProductUnit[];
  stock: StockSnapshot[];
  holds: Hold[];
  settings: Settings;
  cart: CartLine[];

  hydrate: () => void;
  resetData: () => void;
  refreshCatalog: () => void;

  addToCart: (line: CartLine) => void;
  updateCartLine: (productUnitId: string, patch: Partial<CartLine>) => void;
  setCartQuantity: (productUnitId: string, quantity: number) => void;
  removeCartLine: (productUnitId: string) => void;
  clearCart: () => void;

  holdCart: (label?: string) => void;
  resumeHold: (id: string) => void;
  deleteHold: (id: string) => void;
  renameHold: (id: string, label: string) => void;

  afterSaleCommit: () => void;

  updateSettings: (patch: Partial<Settings>) => void;
}

export const usePos = create<PosState>((set, get) => ({
  hydrated: false,
  products: [],
  units: [],
  stock: [],
  holds: [],
  settings: DEFAULT_SETTINGS,
  cart: [],

  hydrate: () => {
    if (typeof window === "undefined") return;
    if (get().hydrated) return;
    runMigrations();
    ensureSeed();
    set({
      hydrated: true,
      products: productsRepo.listProducts(),
      units: unitsRepo.listUnits(),
      stock: ledgerRepo.listStockSnapshots(),
      holds: holdsRepo.listHolds(),
      settings: settingsRepo.getSettings(),
    });
  },

  resetData: () => {
    if (typeof window === "undefined") return;
    clearAll();
    set({
      hydrated: false,
      products: [],
      units: [],
      stock: [],
      holds: [],
      cart: [],
      settings: DEFAULT_SETTINGS,
    });
    get().hydrate();
  },

  refreshCatalog: () => {
    set({
      products: productsRepo.listProducts(),
      units: unitsRepo.listUnits(),
      stock: ledgerRepo.listStockSnapshots(),
    });
  },

  addToCart: (line) => {
    set((state) => {
      const existing = state.cart.find(
        (c) => c.productUnitId === line.productUnitId,
      );
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productUnitId === line.productUnitId
              ? {
                  ...c,
                  quantity: c.quantity + line.quantity,
                  price: line.price,
                }
              : c,
          ),
        };
      }
      return { cart: [...state.cart, line] };
    });
  },

  updateCartLine: (productUnitId, patch) => {
    set((state) => ({
      cart: state.cart.map((c) =>
        c.productUnitId === productUnitId ? { ...c, ...patch } : c,
      ),
    }));
  },

  setCartQuantity: (productUnitId, quantity) => {
    set((state) =>
      quantity <= 0
        ? {
            cart: state.cart.filter(
              (c) => c.productUnitId !== productUnitId,
            ),
          }
        : {
            cart: state.cart.map((c) =>
              c.productUnitId === productUnitId ? { ...c, quantity } : c,
            ),
          },
    );
  },

  removeCartLine: (productUnitId) => {
    set((state) => ({
      cart: state.cart.filter((c) => c.productUnitId !== productUnitId),
    }));
  },

  clearCart: () => set({ cart: [] }),

  holdCart: (label) => {
    const cart = get().cart;
    if (cart.length === 0) return;
    const computed =
      label ??
      `Hold · ${cart[0].productName}${cart.length > 1 ? ` +${cart.length - 1}` : ""}`;
    holdsRepo.holdCart(computed, cart);
    set({ cart: [], holds: holdsRepo.listHolds() });
  },

  resumeHold: (id) => {
    const hold = holdsRepo.getHold(id);
    if (!hold) return;
    const active = get().cart;
    if (active.length > 0) {
      holdsRepo.holdCart(
        `Auto · ${active[0].productName}${active.length > 1 ? ` +${active.length - 1}` : ""}`,
        active,
      );
    }
    holdsRepo.deleteHold(id);
    set({
      cart: hold.lines.map((l) => ({
        productId: l.productId,
        productUnitId: l.productUnitId,
        productName: l.productName,
        unitName: l.unitName,
        price: l.price,
        quantity: l.quantity,
      })),
      holds: holdsRepo.listHolds(),
    });
  },

  deleteHold: (id) => {
    holdsRepo.deleteHold(id);
    set({ holds: holdsRepo.listHolds() });
  },

  renameHold: (id, label) => {
    holdsRepo.renameHold(id, label);
    set({ holds: holdsRepo.listHolds() });
  },

  afterSaleCommit: () => {
    set({
      cart: [],
      stock: ledgerRepo.listStockSnapshots(),
    });
  },

  updateSettings: (patch) => {
    const next = settingsRepo.updateSettings(patch);
    set({ settings: next });
  },
}));

export const stockOf = (
  state: { stock: StockSnapshot[] },
  productUnitId: string,
): number =>
  state.stock.find((s) => s.productUnitId === productUnitId)?.onHand ?? 0;

export const unitsOf = (
  state: { units: ProductUnit[] },
  productId: string,
): ProductUnit[] => state.units.filter((u) => u.productId === productId);

export const cartTotal = (state: { cart: CartLine[] }): number =>
  state.cart.reduce((s, c) => s + c.price * c.quantity, 0);

export const cartItemCount = (state: { cart: CartLine[] }): number =>
  state.cart.reduce((s, c) => s + c.quantity, 0);

export const heldCount = (state: { holds: Hold[] }): number =>
  state.holds.length;

export const categoriesOf = (state: { products: Product[] }): string[] => {
  const set = new Set<string>();
  for (const p of state.products) if (p.category) set.add(p.category);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};
