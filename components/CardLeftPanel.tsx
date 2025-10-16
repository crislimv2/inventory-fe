'use client'
import { useEffect, useRef, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import { Button, Card, MenuProps, message, Modal } from 'antd';
import { Minus, Plus, ShoppingCart } from "lucide-react";

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
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
    const hasSelectedUnits = Object.values(productQuantities).some(qty => qty > 0);


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

    const totalPrice = Object.entries(productQuantities).reduce((sum, [unitId, qty]) => {
      const unit = products?.flatMap(p => p.units || []).find(u => u.Id === unitId);
      return sum + (unit ? unit.price * qty : 0);
    }, 0);

    const updateQuantity = (unitId: string, delta: number) => {
      setProductQuantities(prev => {
        const current = prev[unitId] || 0;
        const newQty = Math.max(0, current + delta);
        if (newQty === 0) {
          const { [unitId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [unitId]: newQty };
      });
    };

    return (
      <>
        <div className="bg-gray-100">
          <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 overflow-y-hidden">
            {products ? products.map((product) => (
              <div
                key={product.id}
                className="bg-white gap-2 py-2 px-1"
              >
                {product.imageUrl && (
                  <div className="border-gray-400 border-1 rounded-lg">
                    <Card
                      hoverable
                      onClick={() => {
                        setIsProductModalOpen(true);
                        setSelectedProduct(product);
                      }}
                      size="small"
                      cover={
                        <img
                          draggable={false}
                          alt="example"
                          src="/1rcgKA.jpg"
                        />
                      }
                      className="w-full object-cover"
                    >
                      <p className="text-md font-semibold py-2">{product.name}</p>
                    </Card>
                  </div>
                )}
              </div>
            )) : []}
          </div>
        </div>
        <Modal
          centered
          open={isProductModalOpen}
          onOk={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onCancel={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          width={700}
        >
          {selectedProduct ? (
            <>
              <div className="flex gap-4">
                <img
                  src={"/1rcgKA.jpg"}
                  alt={selectedProduct.name}
                  className="w-40 h-40 object-cover rounded-md border"
                />
                <div>
                  <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                  <p className="mt-2 text-md">
                    Category: <span className="font-semibold">{selectedProduct.category}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedProduct.units?.map((unit) => {
                    const qty = productQuantities[unit.Id] || 0;
                    const isSelected = qty > 0;
                    return (
                    <div key={unit.Id} className="border p-2 mb-1 rounded-md">
                      {unit.unitName} — <span className="font-bold">Rp {unit.price}</span>
                      <div className="flex items-center gap-2">
                      <Button
                        className="h-8 w-8"
                        size="middle"
                        onClick={() => updateQuantity(unit.Id, -1)}
                        icon={<Minus className="h-3 w-3" />}
                      />
                      <span className="text-base font-bold w-8 text-center">{qty}</span>
                      <Button
                        size="middle"
                        onClick={() => updateQuantity(unit.Id, 1)}
                        icon={<Plus className="h-3 w-3" />}
                      />
                      {isSelected && (
                        <span className="ml-auto text-sm font-semibold text-primary">
                          {(unit.price * qty)}
                        </span>
                      )}
                    </div>
                    </div>
                  )})}
                </div>
              </div>
              {hasSelectedUnits && (
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {totalPrice}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-full gap-4">
                <Button
                  className="mt-4 w-full"
                  style={{padding: '20px 0px'}}
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="mt-4 w-full"
                  style={{padding: '20px 0px'}}
                  type="primary"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  onClick={() => {
                    if (selectedProduct) {
                      handleAddToCart(selectedProduct);
                    }
                    setIsProductModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  disabled={!hasSelectedUnits}
                >
                  Add to Cart
                </Button>
              </div>
            </>
          ) : (
            <p>Loading product...</p>
          )}
        </Modal>

      </>
    )
}

export default CardLeftPanel;