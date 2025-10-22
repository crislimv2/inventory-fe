import { Product } from "./Product";

export interface SelectedProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}