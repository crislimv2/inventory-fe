import { Button, InputNumber, Modal } from "antd";
import { SelectedProductModalProps } from "./interfaces/SelectedProductModalProps";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Product } from "./interfaces/Product";
import { useEffect, useState } from "react";
import { de } from "zod/locales";

const SelectedProductModal : React.FC<SelectedProductModalProps> = ({
    isOpen,
    product,
    productQuantities,
    totalPrice,
    onAddToCart,
    onClose,
    setCart
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);
    const hasSelectedUnits = true;
    useEffect(() => {
        setSelectedProduct(product);
    }, [product]);
    
    const handleCart = () => {

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
                console.log("New Quantity:", newQuantity);
                return { ...unit, quantity: newQuantity };
            }
            return unit;
        });
        console.log("Updated Units:", updatedUnits);
        
        setSelectedProduct({
            ...selectedProduct,
            units: updatedUnits,
        });
        console.log("Selected Product after quantity update:", selectedProduct);

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

            {/* === Units list === */}
            <div className="mt-6">
                <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedProduct?.units?.map((unit) => {
                    const qty = productQuantities[unit.id] || 0;
                    const isSelected = qty > 0;

                    return (
                    <div key={unit.id} className="border p-2 mb-1 rounded-md">
                        <div className="flex-row flex gap-2">
                        <span className="font-bold text-lg">
                            {unit.unitName} <span className="font-normal">—</span>
                        </span>
                        <div className="text-md font-semibold gap-1">
                            <span>Rp </span>
                            <InputNumber
                            value={unit.price}
                            onChange={(value) => handleUpdatePrice(unit.id, value)}
                            controls={false}
                            className="w-24"
                            />
                        </div>
                        </div>

                        <div className="flex items-center gap-2 justify-between mt-3">
                        <div className="flex gap-3 items-center">
                            <Button
                            className="!bg-transparent !text-black hover:!bg-green-600 hover:!text-white"
                            size="middle"
                            onClick={() => handleUpdateQuantity(unit.id, -1)}
                            icon={<Minus className="h-3 w-3" />}
                            />
                            <span className="text-base font-bold w-8 text-center">{unit.quantity}</span>
                            <Button
                            className="!bg-transparent !text-black hover:!bg-green-600 hover:!text-white"
                            size="middle"
                            onClick={() => handleUpdateQuantity(unit.id, 1)}
                            icon={<Plus className="h-3 w-3" />}
                            />
                        </div>

                        {unit.quantity > 0 && (
                            <span className="text-lg font-semibold text-primary w-full flex justify-end text-blue-600">
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
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                    Rp {Number(selectedProduct?.units?.map((unit) => unit.price * unit.quantity).reduce((acc, curr) => acc + curr, 0)).toLocaleString('id-ID')}
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
                    if (product) {
                    onAddToCart(product);
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