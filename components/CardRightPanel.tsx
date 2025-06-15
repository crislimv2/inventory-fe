'use client';

import { Tabs } from 'antd';
import { useRef, useState } from 'react';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface TabItem {
  label: string;
  children: React.ReactNode;
  key: string;
  closable?: boolean;
}

const CardRightPanel = () => {
  const [items, setItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const newTabIndex = useRef(0);

  const add = () => {
    const newKey = `newTab${newTabIndex.current++}`;
    const newTab: TabItem = {
      label: `Tab ${items.length + 1}`,
      children: `Content of Tab ${items.length + 1}`,
      key: newKey,
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
          items={items}
        />
      </div>
    </div>
  );
};

export default CardRightPanel;
