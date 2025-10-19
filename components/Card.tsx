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
    <>
      <div className="block md:hidden bg-gray-400 w-full fixed top-0 z-50">
        <nav className="flex items-center justify-center h-8">
          <h1 className="text-sm font-semibold text-white">Hello</h1>
        </nav>
      </div>

      <div className="bg-[#E9ECEF] min-h-screen w-full flex md:overflow-hidden pt-8 md:pt-0">
        {/* Right Panel (Fixed) */}
        <div className="hidden md:block md:w-5/12 lg:w-4/12 xl:w-3/12 h-screen sticky top-0">
          <CardRightPanel cart={cart} />
        </div>

        {/* Left Panel (Scrollable) */}
        <div className="sm:w-full md:w-7/12 lg:w-8/12 xl:w-9/12 h-screen overflow-y-auto">
          <CardLeftPanel cart={cart} setCart={setCart} />
        </div>
      </div>

    </>
  );
};

export default Card;
