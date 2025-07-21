'use client';

import { Tabs } from 'antd';
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
    console.log('CardRightPanel mounted');
  }, [cart]);

  const renderTab = (cartData: Product[]) => {
    console.log('Rendering tab with cart data:', cartData);
    return (
      <div className="p-2">
        {cartData.length === 0 ? (
          <p>No products in cart.</p>
        ) : (
          <ul className="space-y-1">
            {cartData.map((item) => (
              <li key={item.id} className="border p-2 rounded bg-white">
                <p><strong>{item.name}</strong></p>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const add = () => {
    const newKey = `newTab${newTabIndex.current++}`;
    const newTab: TabItem = {
      label: `Tab ${items.length + 1}`,
      key: newKey,
      cartData: cart,
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
    <div className="flex flex-col items-start w-full h-full bg-gray-200 overflow-hidden">
      <div className="w-full overflow-x-auto whitespace-nowrap">
        <Tabs
          type="editable-card"
          hideAdd={items.length >= 6}
          activeKey={activeKey}
          onChange={onChange}
          onEdit={onEdit}
          items={items.map((item) => ({
            ...item,
            children: renderTab(item.cartData),
          }))}
        />
      </div>
    </div>
  );
};

export default CardRightPanel;
