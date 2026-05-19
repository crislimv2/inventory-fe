import { Product } from "./Product";

export interface HeldTransaction {
  id: string;
  label: string;
  cart: Product[];
  createdAt: Date;
  itemCount: number;
  subtotal: number;
}
