'use client';
import { useEffect, useState } from "react";
import CardLeftPanel from "./CardLeftPanel";
import CardRightPanel from "./CardRightPanel";
import { Product } from "./interfaces/Product";

const Card = () => {
  const [cart, setCart] = useState<Product[]>([]);

  // useEffect(() => {
  //   console.log("Cart initialized:", cart);
  // }, [cart]);

  return (
    <div className="bg-[#E9ECEF] h-screen w-full flex">
      <div className="w-3/12 h-screen overflow-y-hidden">
        <CardRightPanel cart={cart} />
      </div>
      <div className="h-screen w-9/12 overflow-y-scroll">
        <CardLeftPanel cart={cart} setCart={setCart} />
      </div>
    </div>
  );
};

export default Card;
