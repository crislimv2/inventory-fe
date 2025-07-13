'use client'
import { useEffect, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import Image from "next/image";
import { Button, Dropdown, Input, MenuProps, message, Space, Tooltip } from 'antd';
import { CaretDownOutlined, CloseOutlined, DropboxOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { alphabet } from "./constants/Alphabet";

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

console.log(dummyData)

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
    const [activeLetter, setActiveLetter] = useState('');


    const handleDropdownOpenChange = (flag: boolean) => {
      setIsDropdownOpen(flag);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setActiveLetter('');
    };

    const handleLetterClick = (letter: string) => {
        setActiveLetter(letter);
        setSearch(letter);
        if( letter === activeLetter) {
            setSearch("");
            setActiveLetter('');
            setProducts(dummyData);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setProducts(dummyData);
        }, 1000);
    }, []);

    useEffect(() => {
        if (search.length > 1) {
            console.log("Searching for:", search);
            const filteredProducts = dummyData.filter(product => 
                product.name.toLowerCase().includes(search.toLowerCase())
            );
            setProducts(filteredProducts);
        } else if (search === "") {
            console.log("Resetting to all products");
            setProducts(dummyData);
        }
        else {
            console.log("Filtering by letter:", activeLetter);
            const res = dummyData?.filter(product => product.name.toLocaleLowerCase().startsWith(search?.toLocaleLowerCase()));
            setProducts(res);
        }
    }, [search]);

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

        <div className="flex">
          {/* Alphabet Sidebar */}
          <div className="border-x-2 rounded px-1 sticky top-12 left-0 flex flex-col h-screen mt-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`px-1 text-lg mb-1 cursor-pointer transition-colors duration-150
                  ${activeLetter === letter ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-hidden p-2 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-hidden">
              {products ? products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow py-2"
                >
                  {product.imageUrl && (
                    <Image
                      src={'/1rcgKA.jpg'}
                      alt={product.name}
                      width={300}
                      height={150}
                      className="object-cover mb-2 rounded"
                    />
                  )}
                  <div className="px-2 py-1">
                    <h2 className="text-md font-bold text-black">{product.name}</h2>
                    <p className="text-sm text-gray-800 font-semibold">
                      Rp 12.000
                      {/* Rp {product.price.toLocaleString("id-ID")} */}
                    </p>
                    <div>
                      <p className="text-black">Unit:</p>
                      <div className="flex flex-row">
                        {product.units && product.units.length > 0 ? (
                          product.units.map((unit) => (
                            <span key={unit.unitId} className="text-sm text-gray-600 block">
                              {unit.unitName}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-600">Tidak ada unit</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mr-3 mt-3">
                      <Tooltip>
                        <Button type="primary" size="large" variant="solid" shape="circle" icon={<ShoppingCartOutlined />}/>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )) : []}
            </div>
          </div>
        </div>
      </div>
    )
}

export default CardLeftPanel;