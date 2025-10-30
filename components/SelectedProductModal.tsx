import { Button, InputNumber, Modal } from "antd";
import { SelectedProductModalProps } from "./interfaces/SelectedProductModalProps";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Product } from "./interfaces/Product";
import { useEffect, useState } from "react";
import Image from "next/image";

const SelectedProductModal : React.FC<SelectedProductModalProps> = ({
    isOpen,
    product,
    onClose,
    setCart
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        setSelectedProduct(product);
    }, [product]);

    useEffect(() => {
        const newTotal = selectedProduct?.units?.reduce(
            (sum, unit) => sum + unit.price * unit.quantity,
            0
        ) ?? 0;
        setTotalPrice(newTotal);
    }, [selectedProduct]);

    
    const handleAddToCart = () => {
        // Filter only units with quantity > 0
        if(!selectedProduct) return;
        const selectedUnits = selectedProduct?.units?.filter(unit => unit.quantity > 0) || [];

        const productToAdd: Product = {
            ...selectedProduct,
            units: selectedUnits
        };

        // Update the cart in parent
        setCart(prevCart => {

            const existingProductIndex = prevCart.findIndex(p => p.id === productToAdd.id);

            if (existingProductIndex !== -1) {
                // If the product already exists, merge the unit quantities
                const updatedCart = [...prevCart];
                const existingProduct = updatedCart[existingProductIndex];

                const mergedUnits = existingProduct.units?.map(unit => {
                    const newUnit = productToAdd.units?.find(u => u.id === unit.id);
                    if (newUnit) {
                    return {
                        ...unit,
                        quantity: unit.quantity + newUnit.quantity, // merge quantity
                    };
                    }
                    return unit;
                }) || [];

                // Add any *new* unit types that didn’t exist before
                const newUnits = productToAdd.units?.filter(
                    newUnit => !mergedUnits.some(u => u.id === newUnit.id)
                ) || [];

                updatedCart[existingProductIndex] = {
                    ...existingProduct,
                    units: [...mergedUnits, ...newUnits],
                };

                return updatedCart;
            }
            
            // Otherwise, add it as a new product
            return [...prevCart, productToAdd];
        });
    };

    const handleUpdatePrice = (unitId: string, value: number | null) => {
        if (!selectedProduct) return;

        const updatedUnits = selectedProduct?.units?.map((unit) =>
            unit.id === unitId ? { ...unit, price: value || 0 } : unit
        );

        setSelectedProduct({
            ...selectedProduct,
            units: updatedUnits
        });
    };

    const handleUpdateQuantity = (unitId: string, delta: number) => {
        if (!selectedProduct) return;

        const updatedUnits = selectedProduct?.units?.map((unit) => {
            if (unit.id === unitId) {
                const newQuantity = Math.max((unit.quantity || 0) + delta, 0); // prevent negative
                return { ...unit, quantity: newQuantity };
            }
            return unit;
        });
        
        setSelectedProduct({
            ...selectedProduct,
            units: updatedUnits,
        });

    };

    return (
        <Modal
        centered
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={700}
        >
        {selectedProduct ? (
            <>
            {/* === Product header === */}
            <div className="flex gap-4">
                <Image
                    width={70}
                    height={80}
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

            {/* === Units list === */}
            <div className="mt-6">
                <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedProduct?.units?.map((unit) => {
                    return (
                        <div key={unit.id} className="border py-4 px-3 mb-1 rounded-md border-gray-300 bg-blue-100">
                            <div className="flex-col sm:flex-row flex gap-2">
                                <span className="font-semibold text-lg">
                                    {unit.unitName} <span className="font-normal hidden sm:inline">—</span>
                                </span>
                                <div className="text-md font-semibold gap-1">
                                    <span>Rp </span>
                                    <InputNumber
                                        value={unit.price}
                                        onChange={(value) => handleUpdatePrice(unit.id, value)}
                                        controls={false}
                                        className="w-24"
                                        formatter={(value) =>
                                            value
                                                ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                                                : ''
                                        }
                                        parser={(value) => Number(value?.replace(/\./g, '') || '0')}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-between mt-3">
                                <div className="flex gap-3 items-center">
                                    <Button
                                        className="!bg-white !text-black hover:!bg-green-600 hover:!text-white"
                                        size="middle"
                                        shape="circle"
                                        onClick={() => handleUpdateQuantity(unit.id, -1)}
                                        icon={<Minus className="h-3 w-3" />}
                                    />
                                    <span className="text-base font-bold w-8 text-center">{unit.quantity}</span>
                                    <Button
                                        className="!bg-white !text-black hover:!bg-green-600 hover:!text-white"
                                        size="middle"
                                        shape="circle"
                                        onClick={() => handleUpdateQuantity(unit.id, 1)}
                                        icon={<Plus className="h-3 w-3" />}
                                    />
                                </div>

                                {unit.quantity > 0 && (
                                    <span className="text-lg font-semibold text-primary w-full flex justify-start text-blue-600 sm:justify-end sm:mt-2">
                                        Rp {Number(unit.price * unit.quantity).toLocaleString('id-ID')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            {/* === Total === */}
            <div className="flex items-center justify-between p-4 bg-blue-100 rounded-lg">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                        Rp {Number(totalPrice).toLocaleString('id-ID')}
                    </span>
            </div>

            {/* === Footer Buttons === */}
            <div className="flex justify-between w-full gap-4">
                <Button
                    className="mt-4 w-full"
                    style={{ padding: '20px 0px' }}
                    onClick={onClose}
                >
                    Close
                </Button>
                <Button
                    className="mt-4 w-full"
                    style={{ padding: '20px 0px' }}
                    type="primary"
                    icon={<ShoppingCart className="h-4 w-4" />}
                    onClick={() => {
                        if (selectedProduct) {
                            handleAddToCart();
                        }
                        onClose();
                    }}
                    // disabled={!hasSelectedUnits}
                >
                    Add to Cart
                </Button>
            </div>
            </>
        ) : (
            <p>Loading product...</p>
        )}
        </Modal>
    );
};


export default SelectedProductModal;