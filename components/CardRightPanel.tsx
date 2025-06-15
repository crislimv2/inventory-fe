'use client';

import { Tabs } from 'antd';
import { useRef, useState } from 'react';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const initialItems = [
    { label: 'Tab 1', children: 'Content of Tab 1', key: '1', closable: false},
    { label: 'Tab 2', children: 'Content of Tab 2', key: '2' },
    { label: 'Tab 3', children: 'Content of Tab 3', key: '3' },
];

const CardRightPanel = () => {
    const [activeKey, setActiveKey] = useState(initialItems[0].key);
    const [items, setItems] = useState(initialItems);
    const newTabIndex = useRef(0);

    const onChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey);
    };

    const add = () => {
        const newActiveKey = `newTab${newTabIndex.current++}`;
        const newPanes = [...items];
        newPanes.push({ label: 'Tab', children: 'Content of new Tab', key: newActiveKey });
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: TargetKey) => {
        let newActiveKey = activeKey;
        let lastIndex = -1;
        items.forEach((item, i) => {
        if (item.key === targetKey) {
            lastIndex = i - 1;
        }
    });

    const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
        add();
        } else {
        remove(targetKey);
        }
    };

    return (
        <div className="flex flex-col items-start w-full h-full bg-gray-200 overflow-hidden">
            <div className="w-full overflow-x-auto whitespace-nowrap">
                <Tabs
                type="editable-card"
                onChange={onChange}
                activeKey={activeKey}
                onEdit={onEdit}
                items={items}
                hideAdd={items.length >= 6}
                />
            </div>
        </div>

    );
}

export default CardRightPanel;