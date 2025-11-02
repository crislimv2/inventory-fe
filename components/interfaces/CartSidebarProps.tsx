import { Product } from "./Product";
import { ProductUnit } from "./ProductUnit";

export interface CartSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    items: Product[];
    onRemoveItem: (productId:string, unitId: string) => void;
    onUpdateItem: (productId: string, unitId: string, updates: Partial<ProductUnit>) => void;
}