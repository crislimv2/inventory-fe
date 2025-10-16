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
    <div className="bg-[#f8f9fa] h-screen w-auto px-4 py-4 text-[#495057] flex flex-col">
      {/* Scrollable cart section */}
      <div className="flex-1 w-full bg-[#f8f9fa] rounded-sm overflow-y-auto pb-2">
        {cart.length === 0 ? (
          <div className="w-full h-full text-black flex justify-center items-center flex-col">
            <ShoppingCartOutlined style={{ fontSize: '60px' }} />
            <p className="text-black text-xl text-center font-semibold">
              Start adding<br />products
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-2 flex-1" ref={cardRef}>
              <button
                type="button"
                className={`${
                  isSelected ? 'bg-[#DDDBE8]' : 'hover:bg-[#e9ecef]'
                } cursor-pointer py-2 rounded-md w-full text-left`}
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
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="border border-gray-300 bg-white w-10 font-bold text-black text-sm"
                  />
                  <p>x</p>
                  <p>Rp. 20,000.00</p> / <p>Pack</p>
                </div>
              </button>
            </div>
            <div className="p-4 bg-[#f8f9fa]">
              <div className="flex justify-between">
                <p className="font-bold text-2xl">Total</p>
                <p className="font-bold text-2xl">Rp. 20,000.00</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Fixed Calculator at Bottom */}
      {cart.length > 0 && (
        <div
          className="bg-white p-2 mt-2 shrink-0 flex flex-col justify-between"
          style={{
            height: '330px', // ✅ total fixed height for calculator + button
            flex: '0 0 auto',
          }}
        >
          {/* Calculator grid */}
          <div className="grid grid-cols-4 gap-2 flex-grow">
            {['1','2','3','Qty','4','5','6','%','7','8','9','Price','0','00','.','⌫'].map((key, i) => (
              <button
                key={i}
                className={`border rounded-md font-bold text-base ${
                  key === 'Qty' ? 'bg-[#dddbe8]' :
                  key === '.' ? 'bg-red-100' :
                  key === '⌫' ? 'bg-red-300' :
                  'bg-white'
                }`}
                style={{
                  height: '60px', // ✅ fixed button height
                }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Payment button */}
          <button
            className="bg-[#6f55a4] text-white font-bold py-3 mt-3 rounded-md w-full"
            style={{
              flexShrink: 0,
            }}
          >
            Payment
          </button>
        </div>
      )}
    </div>
  );

};

export default CardRightPanel;
