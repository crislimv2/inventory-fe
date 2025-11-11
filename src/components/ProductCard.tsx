import Image from "next/image";
import { Card, CardContent } from "./ui/card";

export function ProductCard({ name, image, units, onClick, cartQuantity }: ProductCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.15)] transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-100 border-2 m-1"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden bg-muted">
            {/* <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            /> */}
            {cartQuantity > 0 && (
              <div className="absolute top-2 right-2 z-10 bg-[#7C3BED] text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                {cartQuantity}
              </div>
            )}
            <Image
                src="/1rcgKA.jpg"
                width={600}
                height={700}
                alt="example"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                draggable={false}
            />
        </div>
        <div className="p-3 space-y-2">
          <p className="font-medium text-sm line-clamp-2 min-h-10">{name}</p>
        </div>
      </CardContent>
    </Card>
  );
}