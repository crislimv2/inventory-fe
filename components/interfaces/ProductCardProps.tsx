interface ProductCardProps {
  name: string;
  image: string;
  units: string[];
  onClick: () => void;
  cartQuantity: number;
  priceFrom?: number;
  category?: string;
  unavailable?: boolean;
}
