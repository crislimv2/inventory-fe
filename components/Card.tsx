'use client';
import { useEffect, useState } from "react";
import CardLeftPanel from "./CardLeftPanel";
import CardRightPanel from "./CardRightPanel";
import { Product } from "./interfaces/Product";

const Card = () => {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    console.log("Cart initialized:", cart);
  }, [cart]);

  return (
    <div className="bg-white h-screen w-full flex">
      <div className="bg-blue-200 h-screen w-3/4 overflow-y-scroll">
        <CardLeftPanel cart={cart} setCart={setCart} />
      </div>
      <div className="bg-yellow-200 w-1/4 sticky top-0 h-screen overflow-y-scroll ">
        <CardRightPanel cart={cart} />
      </div>
    </div>
  );
};

export default Card;
