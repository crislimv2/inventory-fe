import { Product } from "./Product";

export interface SuccessPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    products : Product[];
    totalAmount: number;
    paymentMethod: string;
    setIsCheckoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCart: React.Dispatch<React.SetStateAction<Product[]>>;
    cashReceived: number;
    setCashReceived: React.Dispatch<React.SetStateAction<number>>;
}