'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from './interfaces/Product';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { InputNumber } from 'antd';

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
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(1);


  const total = useMemo(() => {
    return cart.reduce((sum, item) => 
      sum + (item.units?.reduce((uSum, u) => uSum + (u.price * u.quantity), 0) || 0), 0
    );
  }, [cart]);


  // Detect clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setSelectedUnitId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  console.log("cart:", cart);
  return (
    <div className="bg-[#f8f9fa] h-full w-full flex flex-col overflow-hidden text-[#495057]">
      {/* Scrollable cart section */}
      <div className="flex-1 overflow-y-auto" ref={cardRef}>
        {cart.length === 0 ? (
          <div className="w-full h-full text-black flex justify-center items-center flex-col">
            <ShoppingCartOutlined style={{ fontSize: '60px' }} />
            <p className="text-black text-xl text-center font-semibold">
              Start adding<br />products
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-1">
              {cart.map((item) => (
                <div key={item.id}>
                  {item.units?.map((unit) => {
                    const isSelected = selectedUnitId === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        className={`${
                          isSelected ? 'bg-[#DDDBE8]' : 'hover:bg-[#e9ecef]'
                        } cursor-pointer py-2 rounded-md w-full text-left my-1`}
                        onClick={() => setSelectedUnitId(unit.id)}
                      >
                        <div className="flex px-3 justify-between">
                          <p className="font-bold">{item.name}</p>
                          <p className="font-bold">Rp. {Number(unit.price).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex px-3 gap-2">
                          <InputNumber
                            min={0}
                            value={unit.quantity}
                            onChange={(value) => setValue(Number(value))}
                            className="border border-gray-300 bg-white font-bold text-black text-sm"
                            style={{width: '3rem'}}
                            readOnly
                          />
                          <p>x</p>
                          <p>Rp. {Number(unit.price).toLocaleString('id-ID')}</p> / <p>Kg</p>
                        </div>
                      </button>
                    ) 
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Fixed Calculator at Bottom */}
      {cart.length > 0 && (
        <div className="bg-[#f8f9fa] mt-auto mx-3">
          <div className="py-3">
            <div className="flex justify-between">
              <p className="font-bold text-2xl">Total</p>
              <p className="font-bold text-2xl text-blue-600">Rp. {total.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white shrink-0 flex flex-col justify-between">
            <div className="grid grid-cols-4 gap-2">
              {['1','2','3','Qty','4','5','6','%','7','8','9','Price','0','00','.','⌫'].map((key, i) => (
                <button
                  key={i}
                  className={`border rounded-md font-bold text-base ${
                    key === 'Qty' ? 'bg-[#dddbe8]' :
                    key === '.' ? 'bg-red-100' :
                    key === '⌫' ? 'bg-red-300' :
                    'bg-white'
                  }`}
                  style={{ height: '45px' }}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              className="bg-[#6f55a4] text-white font-bold py-3 my-2 rounded-md w-full md:py-2 md:text-sm"
            >
              Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default CardRightPanel;
