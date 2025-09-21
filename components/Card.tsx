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
    <div className="bg-white h-screen w-full flex ">
      <div className="h-screen w-8/12 overflow-y-scroll">
        <CardLeftPanel cart={cart} setCart={setCart} />
      </div>
      <div className="w-4/12 h-screen overflow-y-hidden">
        <CardRightPanel cart={cart} />
      </div>
    </div>
  );
};

export default Card;
