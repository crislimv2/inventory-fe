'use client';

import { useEffect, useRef, useState } from 'react';
import { Product } from './interfaces/Product';
import { ShoppingCartOutlined } from '@ant-design/icons';

interface TabItem {
  label: string;
  // children: React.ReactNode;
  key: string;
  closable?: boolean;
  cartData: Product[];
}

interface CardRightPanelProps {
  cart: Product[];
}

const CardRightPanel = ({ cart }: CardRightPanelProps) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(1);

  // Detect clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  console.log(cart);
  return (
    // <div className="bg-[#E5E7EB] w-full h-full overflow-hidden">
    <div className="bg-[#f8f9fa] w-auto h-full px-4 py-4 text-[#495057]">
      <div className={`${cart.length > 0 ? 'h-[60%]' : 'h-full'} w-full bg-[#f8f9fa]  rounded-sm`}>
        {cart.length == 0 ? (
            <div className='w-full h-full text-black flex justify-center items-center flex-col'>
              <ShoppingCartOutlined style={{ fontSize: '60px' }} />
              <p className='text-black flex justify-center items-center text-xl text-center font-semibold'>Start adding<br></br> products</p>
            </div>
        ) : (
          <div className='flex flex-col h-full'>
            <div className='p-2 flex-1' 
              ref={cardRef}
            >
              {/* <p className='text-black flex justify-center items-center text-xl text-center font-semibold'>Products in Cart: {cart.length}</p> */}
              <button
                type="button"
                className={`${isSelected ? 'bg-[#DDDBE8]' : 'hover:bg-[#e9ecef]'} cursor-pointer py-2 rounded-md w-full text-left`}
                onClick={() => setIsSelected(!isSelected)}
              >
                <div className="flex px-3 justify-between">
                  <p className="font-bold">Kapal Api Mix 23gr (Pack)</p>
                  <p className="font-bold">Rp. 20,000.00</p>
                </div>
                <div className="flex px-3 gap-2">
                  <input
                    type="number"
                    min="0"
                    defaultValue="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="border border-gray-300 bg-white w-10 font-bold text-black"
                  />
                  <p>x</p>
                  <p>Rp. 20,000.00</p> / <p>Pack</p>
                </div>
              </button>
            </div>
            <div className=' p-4 bg-[#f8f9fa]'>
              <div className='flex justify-between'>
                <p className='font-bold text-2xl '>Total</p>
                <p className='font-bold text-2xl '>Rp. 20,000.00</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="h-[40%] bg-white p-2">
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <button className="bg-white border rounded-md font-bold h-16">1</button>
            <button className="bg-white border rounded-md font-bold h-16">2</button>
            <button className="bg-white border rounded-md font-bold h-16">3</button>
            <button className="bg-[#dddbe8] border rounded-md font-bold h-16">Qty</button>

            {/* Row 2 */}
            <button className="bg-white border rounded-md font-bold h-16">4</button>
            <button className="bg-white border rounded-md font-bold h-16">5</button>
            <button className="bg-white border rounded-md font-bold h-16">6</button>
            <button className="bg-white border rounded-md font-bold h-16">%</button>

            {/* Row 3 */}
            <button className="bg-white border rounded-md font-bold h-16">7</button>
            <button className="bg-white border rounded-md font-bold h-16">8</button>
            <button className="bg-white border rounded-md font-bold h-16">9</button>
            <button className="bg-white border rounded-md font-bold h-16">Price</button>

            {/* Row 4 */}
            <button className="bg-white border rounded-md font-bold h-16">0</button>
            <button className="bg-white border rounded-md font-bold h-16">00</button>
            <button className="bg-red-100 border rounded-md font-bold h-16">.</button>
            <button className="bg-red-300 border rounded-md font-bold h-16">⌫</button>
          </div>

          {/* Payment button full width */}
          <button className="bg-[#6f55a4] text-white font-bold py-3 mt-3 rounded-md w-full">
            Payment
          </button>
        </div>
      )}


    </div>
  );
};

export default CardRightPanel;
