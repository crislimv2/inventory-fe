interface ProductCardProps {
  name: string;
  image: string;
  units: string[];
  onClick: () => void;
  cartQuantity: number;
}