import { Product } from "./Product";
import { ProductUnit } from "./ProductUnit";

export interface CartSidebarProps {
  items: Product[];
  onRemoveItem: (productId: string, unitId: string) => void;
  onUpdateItem: (productId: string, unitId: string, updates: Partial<ProductUnit>) => void;
  onClearCart: () => void;
  onHoldCart: () => void;
  onOpenHolds: () => void;
  setIsCheckoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heldCount: number;
}
