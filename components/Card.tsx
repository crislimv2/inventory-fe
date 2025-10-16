'use client';
import { useState } from "react";
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
      <div className="sm:w-6/12 md:w-5/12 lg:w-4/12 xl:w-3/12 h-screen overflow-y-auto">
        <CardRightPanel cart={cart} />
      </div>
      <div className="sm:w-6/12 md:w-7/12 lg:w-8/12 xl:w-9/12 h-screen overflow-y-scroll">
        <CardLeftPanel cart={cart} setCart={setCart} />
      </div>
    </div>
  );
};

export default Card;
