import { Product } from "./Product";

export interface CartSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    items: Product[];
    // onRemoveItem: (productId: string) => void;
    // onUpdateItem: (productId: string, updates: Partial<Product>) => void;
}