'use client'
import { useEffect, useRef, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import Image from "next/image";
import { Button, Dropdown, Input, MenuProps, message, Space, Tag, Tooltip } from 'antd';
import { CaretDownOutlined, CloseOutlined, DropboxOutlined, MinusOutlined, PlusOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { alphabet } from "./constants/Alphabet";
import InputNumber from "./InputNumber";

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

interface CardLeftPanelProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}

const CardLeftPanel = ({ cart, setCart }: CardLeftPanelProps) => {
    const [products, setProducts] = useState<Product[]>();
    // const [cart, setCart] = useState<Product[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeLetter, setActiveLetter] = useState('');
    const [selectedUnits, setSelectedUnits] = useState<Record<string, string | null>>({});
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      setSelectedUnits((prev) => {
        if (prev[productId] === unitId) return prev; // ✅ skip unnecessary updates
        return { ...prev, [productId]: unitId };
      });
    };


    // useEffect(() => {
    //   console.log("Cart updated:", cart);
    // }, [cart]);

    const handleAddToCart = (product: Product) => {
      const productId = product.id;

       const productQuantities = quantities[productId];
      if (!productQuantities) {
        message.error("Please select a unit before adding to cart.");
        return;
      }

      // Get unit IDs with quantity > 0
      const selectedUnitIds = Object.keys(productQuantities).filter(
        (unitId) => productQuantities[unitId] > 0
      );

      if (selectedUnitIds.length === 0) {
        message.error("Please select at least one unit with quantity > 0.");
        return;
      }

      const newUnits = selectedUnitIds.map((unitId) => {
        const unitInfo = getUnitInfo(product, unitId);
        return {
          Id: unitId,
          product_id: productId,
          unitName: unitInfo?.unitName,
          price: unitInfo?.price,
          quantity: productQuantities[unitId],
        };
      });

      setCart((prevCart) => {
        const existingProductIndex = prevCart.findIndex((item) => item.id === productId);
    
        if (existingProductIndex !== -1) {
          const existingProduct = prevCart[existingProductIndex];
          const existingUnits = existingProduct.units || [];
        
          const updatedUnits = [...existingUnits];

          for (const newUnit of newUnits) {
            const existingUnitIndex = updatedUnits.findIndex((u) => u.Id === newUnit.Id);
            if (existingUnitIndex !== -1) {
              // ✅ Update quantity
              updatedUnits[existingUnitIndex] = {
                ...updatedUnits[existingUnitIndex],
                quantity: updatedUnits[existingUnitIndex].quantity + newUnit.quantity,
              };
            } else {
              // ✅ Add new unit
              updatedUnits.push(newUnit);
            }
          }

          const updatedProduct = { ...existingProduct, units: updatedUnits };
          const updatedCart = [...prevCart];
          updatedCart[existingProductIndex] = updatedProduct;

          message.success("Units added to existing product in cart.");
          return updatedCart;
        }

        // Product not in cart, create new item
        const newCartItem = {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          category: product.category,
          createdAt: product.createdAt ?? new Date(),
          createdBy: product.createdBy ?? "system",
          units: newUnits,
        };

        message.success("Product with selected units added to cart.");
        return [...prevCart, newCartItem];
      });

      // Reset quantity for the selected units
      setQuantities((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          ...Object.fromEntries(selectedUnitIds.map((unitId) => [unitId, 0])),
        },
      }));
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
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-4 overflow-y-hidden ">
              {products ? products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow py-2 flex flex-row"
                >
                  {product.imageUrl && (
                    <div className={`w-[30%] h-full bg-amber-300`}>
                      <Image
                        src={'/1rcgKA.jpg'}
                        alt={product.name}
                        width={400}
                        height={100}
                        className="object-cover mb-2 rounded overflow-hidden h-full w-full object-center"
                      />
                    </div>
                  )}
                  <div className={`py-1 flex flex-col w-[70%]`}>
                    <h1 className="text-md font-bold text-black text-2xl">
                      {product.name}
                    </h1>

                    <p className=" text-gray-800 font-semibold text-xl">
                      {(() => {
                        const unitId = selectedUnits[product.id];
                        if (!unitId) return "Rp -";

                        const unitInfo = getUnitInfo(product, unitId);
                        if (!unitInfo) return "Rp -";

                        return `Rp ${unitInfo.price.toLocaleString("id-ID")} / (${unitInfo.unitName})`;
                      })()}
                    </p>

                    <div className="flex flex-row justify-center items-end overflow-x-hidden gap-3 mx-5 mt-3">
                      <Button
                        className="mr-2"
                        type="primary"
                        size="middle"
                        variant="solid"
                        shape="circle"
                        // disabled={!selectedUnits[product.id] || quantities[product.id] <= 0 || quantities[product.id] === undefined}
                        icon={<MinusOutlined />}
                        onClick={() => {
                          const unitId = selectedUnits[product.id];
                          if (!unitId) return; // no unit selected
                          if (quantities[product.id]?.[unitId] >= 1) {
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: {
                                ...(prev[product.id] || {}),
                                [unitId]: (prev[product.id]?.[unitId] || 0) - 1
                              }
                            }));
                          }
                        }}
                      ></Button>
                      <div className="flex flex-row overflow-x-scroll">
                        {product.units && product.units.length > 0 ? (
                          product.units.map((unit) => {
                            const isSelected = selectedUnits[product.id] === unit.Id;
                            const quantityValue = quantities?.[product.id]?.[unit.Id] || null;
                            const refKey = `${product.id}-${unit.Id}`;

                            const handleChange = () => {
                              handleUnitToggle(product.id, unit.Id);
                              inputRefs.current[refKey]?.focus();
                            };

                            const handleQuantityChange = (val: number) => {
                              setQuantities((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...(prev[product.id] || {}),
                                  [unit.Id]: val,
                                },
                              }));
                            };

                            return (
                            <div className="flex flex-col m-0 p-0 items-center justify-items-center" key={unit.Id}>
                              <Tag.CheckableTag
                                className="bg-white font-semibold border-2"
                                style={{ 
                                  margin: "0px",
                                  padding: "3px 5px",
                                  width: "60px",
                                  fontSize: "14px",
                                  borderRadius: "0px",
                                  borderBottomWidth: "1px",
                                  borderColor: selectedUnits[product.id] === unit.Id ? '#1890ff' : '#d9d9d9',
                                }}
                                checked={isSelected}
                                onChange={handleChange}
                              >
                                {unit.unitName}
                              </Tag.CheckableTag>
                              <InputNumber 
                                ref={(el) => {
                                  inputRefs.current[refKey] = el;
                                }} 
                                value={quantityValue} 
                                onChange={handleQuantityChange} 
                                onFocus={() => {
                                  if(selectedUnits[product.id] !== unit.Id) {
                                    handleUnitToggle(product.id, unit.Id);
                                  }
                                }}
                              />
                            </div>
                            )
                          })
                        ) : (
                          <span className="text-sm text-gray-600">Tidak ada unit</span>
                        )}
                      </div>
                      <Button
                        className="ml-2"
                        type="primary"
                        size="middle"
                        variant="solid"
                        shape="circle"
                        icon={<PlusOutlined />}
                        disabled={!selectedUnits[product.id]}
                        onClick={() => {
                          const unitId = selectedUnits[product.id];
                          if (!unitId) return; // no unit selected

                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...(prev[product.id] || {}),
                              [unitId]: (prev[product.id]?.[unitId] || 0) + 1
                            }
                          }));
                        }}
                      ></Button>
                    </div>

                    <div className="flex justify-end mr-3 mt-3">
                      <Tooltip>
                        <Button 
                          onClick={() => handleAddToCart(product)} 
                          type="primary" 
                          htmlType="submit" 
                          size="large" 
                          variant="solid" 
                          shape="circle" 
                          icon={<ShoppingCartOutlined />}
                          disabled={!selectedUnits[product.id]}
                          
                        />
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