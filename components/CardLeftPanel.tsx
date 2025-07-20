'use client'
import { useEffect, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import Image from "next/image";
import { Button, Dropdown, Input, InputNumber, MenuProps, message, Space, Tag, Tooltip } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, CloseOutlined, DownCircleFilled, DropboxOutlined, SearchOutlined, ShoppingCartOutlined, UpCircleFilled } from '@ant-design/icons';
import { alphabet } from "./constants/Alphabet";
import { set } from "zod";
import { ProductUnit } from "./interfaces/ProductUnit";

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
    const [products, setProducts] = useState<Product[]>();
    const [cart, setCart] = useState<Product[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeLetter, setActiveLetter] = useState('');
    const [selectedUnits, setSelectedUnits] = useState<Record<string, string | null>>({});
    const [quantities, setQuantities] = useState<Record<string, number>>({});


    const onSubmit = async (formData : any) => {
      const payload = {
        ...formData
      }

      console.log("Form submitted with data:", payload);

      // Handle form submission logic here
    };



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

    const getUnitInfo = (product : Product, unitId: string) => {
      const selectedProduct = product.units?.find((u) => u.Id === unitId);
      const unit = {
        Id: selectedProduct?.Id || "",
        product_id: product.id,
        unitName: selectedProduct?.unitName || "",
        price: selectedProduct?.price || 0,
      };
      return unit ?? null;
    };


    const handleUnitToggle = (productId: string, unitId: string) => {
      setSelectedUnits((prev) => ({
        ...prev,
        [productId]: prev[productId] === unitId ? null : unitId, // toggle logic
      }));
    };

    useEffect(() => {
      console.log("Cart updated:", cart);
    }, [cart]);

    const handleAddToCart = (productId: string) => {
      const unitId = selectedUnits[productId];
      if (!unitId) {
        message.error("Please select a unit before adding to cart.");
        return;
      }

      const quantity = quantities[productId] || 0;
      if (quantity <= 0) {
        message.error("Quantity must be greater than zero.");
        return;
      }

      const product = products?.find((p) => p.id === productId);
      if (!product) {
        message.error("Product not found.");
        return;
      }

      const unitInfo = getUnitInfo(product, unitId);
      if (!unitInfo) {
        message.error("Selected unit not found.");
        return;
      }

      const newUnit = {
        Id: unitId,
        product_id: productId,
        unitName: unitInfo.unitName,
        price: unitInfo.price,
        quantity: quantity,
      };

      setCart((prevCart) => {
        const existingProductIndex = prevCart.findIndex((item) => item.id === productId);

        // If product already exists in cart
        if (existingProductIndex !== -1) {
          const existingProduct = prevCart[existingProductIndex];

          // Check if the unit already exists
          const unitExists = existingProduct.units?.some((u) => u.Id === unitId);

          if (unitExists) {
            message.error("This product with the selected unit is already in the cart.");
            return prevCart;
        }

        // Add new unit to existing product
        const updatedUnits = [...(existingProduct.units || []), newUnit];
        const updatedProduct = { ...existingProduct, units: updatedUnits };

        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex] = updatedProduct;

        message.success("Unit added to existing product in cart.");
          return updatedCart;
        }

        // If product not in cart, add as new item
        const newCartItem = {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          category: product.category,
          createdAt: product.createdAt ?? new Date(),
          createdBy: product.createdBy ?? "system",
          units: [newUnit],
        };

        message.success("Product added to cart.");
          return [...prevCart, newCartItem];
        });

        // Reset quantity after adding to cart
        setQuantities((prev) => ({ ...prev, [productId]: 0 }));
    };


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
            setProducts(dummyData);
        }
        else {
            const res = dummyData?.filter(product => product.name.toLocaleLowerCase().startsWith(search?.toLocaleLowerCase()));
            setProducts(res);
        }
    }, [search]);

    useEffect(() => {
      if (products && Array.isArray(products)) {
        const defaults: Record<string, string> = {};

        products.forEach((product) => {
          const units = product.units ?? [];
          if (units.length > 0 && !selectedUnits[product.id]) {
            defaults[product.id] = units[0].Id;
          }
        });

        if (Object.keys(defaults).length > 0) {
          setSelectedUnits((prev) => ({ ...prev, ...defaults }));
        }
      }
    }, [products]);

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
                  <div className="px-2 py-1 flex flex-col gap-2">
                    <h2 className="text-md font-bold text-black text-xl">
                      {product.name}
                    </h2>

                    <p className=" text-gray-800 font-semibold text-xl">
                      {(() => {
                        const unitId = selectedUnits[product.id];
                        if (!unitId) return "Rp -";

                        const unitInfo = getUnitInfo(product, unitId);
                        if (!unitInfo) return "Rp -";

                        return `Rp ${unitInfo.price.toLocaleString("id-ID")} / (${unitInfo.unitName})`;
                      })()}
                    </p>


                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {product.units && product.units.length > 0 ? (
                          product.units.map((unit) => (
                            <Tag.CheckableTag
                              key={unit.Id}
                              className="bg-white font-semibold border-2"
                              style={{ 
                                padding: "6px 12px", 
                                fontSize: "16px",
                                borderRadius: "8px",
                                borderWidth: "2px",
                                borderColor: selectedUnits[product.id] === unit.Id ? '#1890ff' : '#d9d9d9',
                              }}
                              checked={selectedUnits[product.id] === unit.Id}
                              onChange={() => {
                                handleUnitToggle(product.id, unit.Id);
                              }}
                            >
                              {unit.unitName}
                            </Tag.CheckableTag>

                            
                          ))
                        ) : (
                          <span className="text-sm text-gray-600">Tidak ada unit</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="primary"
                          size="small"
                          variant="solid"
                          shape="circle"
                          disabled={!selectedUnits[product.id]}
                          icon={<CaretDownOutlined />}
                          onClick={() => {
                            const currentQuantity = quantities[product.id] || 0;
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(0, currentQuantity - 1), // Prevent negative quantity
                            }));
                          }}
                        />

                        <InputNumber
                          placeholder="qty"
                          variant="outlined"
                          className=""
                          size="large"
                          min={0}
                          disabled={!selectedUnits[product.id]}
                          value={quantities[product.id] || 0}
                          onChange={(value) => {
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: value || 0,
                            }));
                          }}
                        />
                        <Button
                          type="primary"
                          size="small"
                          variant="solid"
                          shape="circle"
                          icon={<CaretUpOutlined />}
                          disabled={!selectedUnits[product.id]}
                          onClick={() => {
                            const currentQuantity = quantities[product.id] || 0;
                            console.log("Current quantity:", currentQuantity);
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: currentQuantity + 1, // Increment quantity
                            }));
                          }}
                        />
                      </div>
                      
                    </div>

                    <div className="flex justify-end mr-3 mt-3">
                      <Tooltip>
                        <Button onClick={() => handleAddToCart(product.id)} type="primary" htmlType="submit" size="large" variant="solid" shape="circle" icon={<ShoppingCartOutlined />}/>
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