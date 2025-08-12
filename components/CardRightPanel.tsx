'use client';

import { Input, InputNumber, Space, Tabs } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Product } from './interfaces/Product';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

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
  const [items, setItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const newTabIndex = useRef(0);

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((tab) =>
        tab.key === activeKey
          ? { ...tab, cartData: [...cart] }
          : tab
      )
    );
  }, [cart]);

  useEffect(() => {
    add();
  }, [])

  const renderTab = (cartData: Product[]) => {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {cartData.length === 0 ? (
            <p>No products in cart.</p>
          ) : (
            cartData.map((product, index) => (
              <div key={product.id} className="py-1">
                <div className="flex flex-row w-full items-center justify-between px-2">
                  <h1 className="text-md font-semibold text-black text-2xl">
                    {`${index + 1}. ${product.name}`}
                  </h1>

                </div>
                {product?.units?.map((unit) => (
                  <div key={unit.Id} className="flex flex-row w-full px-2 text-lg items-center">
                    <div className="w-full items-center grid grid-cols-3">
                      <div className='flex flex-row justify-start items-center pb-1'>
                        <Space direction="vertical">
                          <InputNumber
                            defaultValue={unit.quantity}
                            min={1}
                            max={999}
                            controls={false}
                            style={{ width: 50 }}
                            onChange={(newQuantity) => {
                              setItems((prevItems) =>
                                prevItems.map((tab) =>
                                  tab.key === activeKey
                                    ? {
                                        ...tab,
                                        cartData: tab.cartData.map((p) =>
                                          p.id === product.id
                                            ? {
                                                ...p,
                                                units: p.units?.map((u) =>
                                                  u.Id === unit.Id ? { ...u, quantity: Number(newQuantity) || 0 } : u
                                                ),
                                              }
                                            : p
                                        ),
                                      }
                                    : tab
                                )
                              );
                            }}
                          />
                        </Space>
                        <p className="">x</p>
                      </div>
                      {/* <p className="w-1/6">{`${unit.quantity}  x`}</p> */}
                      <div className='col-span-2'>
                        <Space direction="vertical">
                          <InputNumber 
                            controls={false}
                            addonBefore="Rp" 
                            addonAfter={unit.unitName}
                            defaultValue={unit.price} 
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onChange={(newPrice) => {
                              setItems((prevItems) =>
                                prevItems.map((tab) =>
                                  tab.key === activeKey
                                    ? {
                                        ...tab,
                                        cartData: tab.cartData.map((p) =>
                                          p.id === product.id
                                            ? {
                                                ...p,
                                                units: p.units?.map((u) =>
                                                  u.Id === unit.Id ? { ...u, price: Number(newPrice) || 0 } : u
                                                ),
                                              }
                                            : p
                                        ),
                                      }
                                    : tab
                                )
                              );
                            }}
                          />  
                        </Space>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 border-b border-black pb-2 px-3 border-dashed">
                  <p className="font-semibold">Subtotal</p>
                  <p className="font-semibold grid-span-3 pl-2">
                    Rp. {product.units?.reduce((sum, unit) => sum + unit.price * unit.quantity, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total at bottom */}
        <div className="flex flex-row w-full justify-between border-t border-black mt-2 pt-2 mb-16">
          <p className="w-3/4 text-lg font-semibold">Total</p>
          <p className="w-1/4 text-lg font-semibold flex justify-center">
            Rp. {cartData
              .reduce(
                (total, product) =>
                  total +
                  (product?.units
                    ? product.units.reduce(
                        (sum, unit) => sum + unit.price * unit.quantity,
                        0
                      )
                    : 0),
                0
              )
              .toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    );
  };


  const add = () => {
    const newKey = `newTab${newTabIndex.current++}`;
    const newCart : Product[] = [];
    const newTab: TabItem = {
      label: `Tab ${items.length + 1}`,
      key: newKey,
      cartData: newCart,
      closable: false
    };
    setItems([...items, newTab]);
    setActiveKey(newKey);
  };

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newItems = items.filter((item) => item.key !== targetKey);
    if (newItems.length && newActiveKey === targetKey) {
      newActiveKey = newItems[lastIndex >= 0 ? lastIndex : 0].key;
    } else if (!newItems.length) {
      newActiveKey = '';
    }

    setItems(newItems);
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="w-full h-full bg-gray-200">
      <Tabs
        type="editable-card"
        hideAdd={true}
        activeKey={activeKey}
        onChange={onChange}
        onEdit={onEdit}
        items={items.map((item) => ({
          ...item,
          children: renderTab(item.cartData),
        }))}
        className='h-full'
      />
    </div>
  );
};

export default CardRightPanel;
