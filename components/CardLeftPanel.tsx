'use client'
import { useEffect, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import SelectedProductModal from "./SelectedProductModal";
import { Button, Card, InputNumber, MenuProps, message, Modal } from 'antd';
import { Minus, Plus, ShoppingCart } from "lucide-react";

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');                                                                  
  console.log('click', e);
};

interface CardLeftPanelProps {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
}

const CardLeftPanel = ({ cart, setCart }: CardLeftPanelProps) => {
    const [products, setProducts] = useState<Product[]>();
    // const [cart, setCart] = useState<Product[]>([]);
    const [search, setSearch] = useState<string>("");
    const [selectedUnits, setSelectedUnits] = useState<Record<string, string | null>>({});
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const getUnitInfo = (product : Product, unitId: string) => {
      const selectedProduct = product.units?.find((u) => u.id === unitId);
      const unit = {
        Id: selectedProduct?.id || "",
        product_id: product.id,
        unitName: selectedProduct?.unitName || "",
        price: selectedProduct?.price || 0,
      };
      return unit ?? null;
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

    // useEffect(() => {
    //     if (search.length > 1) {
    //         console.log("Searching for:", search);
    //         const filteredProducts = dummyData.filter(product => 
    //             product.name.toLowerCase().includes(search.toLowerCase())
    //         );
    //         setProducts(filteredProducts);
    //     } else if (search === "") {
    //         setProducts(dummyData);
    //     }
    //     else {
    //         const res = dummyData?.filter(product => product.name.toLocaleLowerCase().startsWith(search?.toLocaleLowerCase()));
    //         setProducts(res);
    //     }
    // }, [search]);

    useEffect(() => {
      if (products && Array.isArray(products)) {
        const defaults: Record<string, string> = {};

        products.forEach((product) => {
          const units = product.units ?? [];
          if (units.length > 0 && !selectedUnits[product.id]) {
            defaults[product.id] = units[0].id;
          }
        });

        if (Object.keys(defaults).length > 0) {
          setSelectedUnits((prev) => ({ ...prev, ...defaults }));
        }
      }
    }, [products]);

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
                        setSelectedProduct(product);
                        setIsProductModalOpen(true);
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
        <SelectedProductModal
          isOpen={isProductModalOpen}
          product={selectedProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          setCart={setCart}
        />
      </>
    )
}

export default CardLeftPanel;