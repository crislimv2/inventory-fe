import { Product } from "./Product";

export interface CheckoutProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[] | []
};
export default CheckoutProductModalProps;