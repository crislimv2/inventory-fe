'use client'
import { useEffect, useState } from "react";
import { Product } from "./interfaces/Product";
import Image from "next/image";
import { Button, Dropdown, Input, MenuProps, message, Space } from 'antd';
import { CaretDownOutlined, CloseOutlined, DownOutlined, DropboxOutlined, SearchOutlined } from '@ant-design/icons';
const dummyData : Product[] =  [
    {
        id: "1",
        sku: "SKU-001",
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with adjustable DPI.",
        price: 250000,
        quantity: 100,
        imageUrl: "https://via.placeholder.com/150",
        category: "Electronics",
        brand: "Logitech",
        barCode: "1234567890123",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-03-05"),
        createdBy: "admin",
        updatedBy: "admin",
    },
    {
        id: "2",
        sku: "SKU-002",
        name: "Mechanical Keyboard",
        description: "RGB backlit mechanical keyboard with blue switches.",
        price: 750000,
        quantity: 50,
        imageUrl: "https://via.placeholder.com/150",
        category: "Electronics",
        brand: "Razer",
        barCode: "9876543210987",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-02-01"),
        createdBy: "admin",
    },
    {
        id: "3",
        sku: "SKU-003",
        name: "Gaming Chair",
        description: "Comfortable chair for long gaming sessions.",
        price: 1500000,
        quantity: 20,
        imageUrl: "https://via.placeholder.com/150",
        category: "Furniture",
        brand: "Secretlab",
        barCode: "1122334455667",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-03-01"),
        createdBy: "admin",
        updatedBy: "editor",
    },
    {
        id: "4",
        sku: "SKU-004",
        name: "LED Monitor 24\"",
        description: "Full HD 24-inch LED monitor with HDMI input.",
        price: 1300000,
        quantity: 30,
        imageUrl: "https://via.placeholder.com/150",
        category: "Electronics",
        brand: "AOC",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-01-20"),
        createdBy: "admin",
    },
    {
        id: "5",
        sku: "SKU-005",
        name: "USB-C Hub",
        description: "Multi-port USB-C hub with HDMI and USB 3.0.",
        price: 300000,
        quantity: 80,
        imageUrl: "https://via.placeholder.com/150",
        category: "Accessories",
        brand: "Anker",
        barCode: "5566778899001",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-04-10"),
        createdBy: "admin",
    },
    {
        id: "6",
        sku: "SKU-006",
        name: "External Hard Drive 1TB",
        description: "Portable 1TB external hard drive USB 3.1.",
        price: 900000,
        quantity: 40,
        imageUrl: "https://via.placeholder.com/150",
        category: "Accessories",
        brand: "WD",
        barCode: "5566778899001",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-03-01"),
        createdBy: "admin",
    },
    {
        id: "7",
        sku: "SKU-007",
        name: "Bluetooth Speaker",
        description: "Waterproof portable Bluetooth speaker.",
        price: 450000,
        quantity: 60,
        imageUrl: "https://via.placeholder.com/150",
        category: "Audio",
        brand: "JBL",
        barCode: "3344556677889",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-02-20"),
        createdBy: "admin",
        updatedBy: "editor",
    },
    {
        id: "8",
        sku: "SKU-008",
        name: "Smartphone Stand",
        description: "Adjustable desk stand for smartphones.",
        price: 120000,
        quantity: 150,
        imageUrl: "https://via.placeholder.com/150",
        category: "Accessories",
        brand: "UGREEN",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-02-05"),
        createdBy: "admin",
    },
    {
        id: "9",
        sku: "SKU-009",
        name: "Laptop Sleeve 15\"",
        description: "Shock-resistant sleeve for 15-inch laptops.",
        price: 200000,
        quantity: 90,
        imageUrl: "https://via.placeholder.com/150",
        brand: "CaseLogic",
        barCode: "7788990011223",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-02-10"),
        createdBy: "admin",
    },
    {
        id: "10",
        sku: "SKU-010",
        name: "Webcam 1080p",
        description: "Full HD webcam with built-in microphone.",
        price: 500000,
        quantity: 35,
        imageUrl: "https://via.placeholder.com/150",
        category: "Electronics",
        brand: "Logitech",
        unitOfMeasure: "pcs",
        createdAt: new Date("2024-03-15"),
        createdBy: "admin",
    }
];

const items: MenuProps['items'] = [
  {
    label: 'Kopi',
    key: '1',
  },
  {
    label: 'Rokok',
    key: '2',
  },
  {
    label: 'Sabun Mandi',
    key: '3',
  },
  {
    label: 'Sabun Cuci',
    key: '4',
  },
  {
    label: 'Minuman Saset',
    key: '5',
  },
];

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const menuProps = {
  items,
  onClick: handleMenuClick,
};

const CardLeftPanel = () => {
    const  [products, setProducts] = useState<Product[]>();
    const [search, setSearch] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDropdownOpenChange = (flag: boolean) => {
      setIsDropdownOpen(flag);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        // Simulate fetching data from an API
        setTimeout(() => {
            setProducts(dummyData);
        }, 1000);
    }, []);

    return (
      <div className="bg-gray-100">
        <div className="bg-gray-200 p-4 mb-4">
          <h1 className="text-2xl font-bold text-black">Product List</h1>
          <div className="flex justify-between items-center gap-20">
            <Dropdown 
              menu={menuProps}  
              trigger={['click']}
              open={isDropdownOpen}
              onOpenChange={handleDropdownOpenChange}
            >
              <Button 
                size="large" 
                icon={<DropboxOutlined className={`text-[17px]`} />} 
                className="bg-white border border-gray-300 hover:bg-gray-50" 
                style={{
                  padding: "10px 18px",
                  fontSize: "16px",
                  height: "auto"
                }}
              >
                <Space>
                  <h3 className="text-black font-semibold text-xl">Category</h3>
                  <CaretDownOutlined
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    style={{ color: "black" }}
                  />
                </Space>
              </Button>
            </Dropdown>

            <Input 
              size="large" 
              value={search}
              onChange={handleSearchChange} 
              placeholder="Cari Nama Barang.." 
              suffix={
                search!="" && (
                  <CloseOutlined 
                    className="cursor-pointer" 
                    onClick={() => setSearch("")}
                  />
                )
              }
              prefix={<SearchOutlined className={`p-1 mr-1 text-[17px]`}/>} 
              style={{
                  padding: "12px 18px",
                  fontSize: "16px",
                  height: "auto"
                }}
            />
          </div>
        </div>

        <div className=" p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-screen overflow-y-auto">
          {products ? products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              {product.imageUrl && (
                <Image
                  src={'/1rcgKA.jpg'}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="object-cover mb-2 rounded"
                />
              )}
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p className="text-sm text-gray-600 mb-1">{product.description}</p>
              <p className="text-sm text-gray-800 font-semibold">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
              {product.category && (
                <span className="text-xs mt-1 inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {product.category}
                </span>
              )}
            </div>
          )) : []}
        </div>
      </div>
    )
}

export default CardLeftPanel;