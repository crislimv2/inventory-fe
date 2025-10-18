import { Product } from "./Product";

export interface SelectedProductModalProps {
    isOpen: boolean;
    product: Product | null;
    productQuantities: Record<string, number>;
    totalPrice: number;
    onAddToCart: (product: Product) => void;
    onClose: () => void;
    setCart?: React.Dispatch<React.SetStateAction<Product[]>>;
}