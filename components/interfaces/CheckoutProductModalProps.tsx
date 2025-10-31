import { Product } from "./Product";

export interface CheckoutProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[] | [];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
  setIsCheckoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export default CheckoutProductModalProps;