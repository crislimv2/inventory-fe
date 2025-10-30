import { Product } from "./Product";

export interface CheckoutProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[] | [];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
};
export default CheckoutProductModalProps;