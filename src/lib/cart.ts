import { Product } from "../../components/interfaces/Product";

export const computeCartTotals = (cart: Product[]) => {
  let itemCount = 0;
  let lineCount = 0;
  let subtotal = 0;
  for (const product of cart) {
    for (const unit of product.units ?? []) {
      lineCount += 1;
      itemCount += unit.quantity || 0;
      subtotal += (unit.price || 0) * (unit.quantity || 0);
    }
  }
  return { itemCount, lineCount, subtotal: Math.round(subtotal) };
};

export const getProductCartQuantity = (cart: Product[], productId: string): number => {
  const product = cart.find((p) => p.id === productId);
  if (!product?.units) return 0;
  return product.units.reduce((sum, u) => sum + (u.quantity || 0), 0);
};

export const getCategoriesFromProducts = (products: Product[]): string[] => {
  const set = new Set<string>();
  for (const p of products) {
    if (p.category) set.add(p.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

export const cloneCart = (cart: Product[]): Product[] =>
  cart.map((p) => ({
    ...p,
    units: p.units?.map((u) => ({ ...u })) ?? [],
  }));
