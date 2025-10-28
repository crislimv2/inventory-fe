import React from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { Button, Modal } from "antd";
import { Trash2Icon, TrashIcon } from "lucide-react";

const CheckoutProductModal : React.FC<CheckoutProductModalProps> = ({ isOpen, onClose, cart, setCart }) => {
  console.log(cart);
  let idx = 0;
  return (
    <div>
        <Modal
          width={1350}
          open={isOpen}
          onCancel={onClose}
          maskClosable={false}
          footer={null}
          className=""
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
          </div>
          <div className="w-full flex flex-row gap-2">
            <div className="w-6/12 ">
              <div className="">
                <div>
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                </div>
                <div className="bg-gray-100 rounded-md overflow-y-scroll h-[550px] px-1">
                  {cart.map((product) => (
                    <div key={product.id}>
                      {product.units?.map((unit) => {
                        idx++;
                        return (
                          <div key={unit.id} className="mx-1 px-1 py-2 border-gray-400 p-2 flex flex-col justify-start">
                            <div className="flex justify-between w-full">
                              <div className="w-1/12 flex justify-center items-center rounded-l-md bg-green-500">
                                <h1 className="text-white">{idx}</h1>
                              </div>
                              <div className="w-10/12 px-3 py-1 bg-gray-300">
                                <div className="flex gap-2 items-center">
                                  <p className="text-md">{product.name}</p>
                                  <p className="text-sm">({unit.unitName})</p>
                                </div>
                                <div className="flex flex-row w-full justify-between">
                                  <div className="flex flex-row items-center">
                                    <p>{unit.quantity}</p>
                                    <p className="mx-2">x</p>
                                    <p>Rp {Number(unit.price).toLocaleString('id-ID')}</p>
                                  </div>
                                  <p className=" font-semibold">Rp {Number(unit.quantity * unit.price).toLocaleString('id-ID')}</p>
                                </div>  
                              </div>
                              <button 
                                className="w-1/12 bg-red-500 flex justify-center items-center rounded-r-md"
                                onClick={() => {
                                  // Remove unit from cart
                                  setCart(prevCart => {
                                    return prevCart.map(p => {
                                      if (p.id === product.id) {
                                        return {
                                          ...p,
                                          units: p.units?.filter(u => u.id !== unit.id)
                                        };
                                      }
                                      return p;
                                    });
                                  });
                                }}
                              >
                                <Trash2Icon color="#ffffff" size={20}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="border my-3 border-gray-300"></div>
                <div className="">
                  <h3 className="text-lg font-semibold">Total Items: {cart.reduce((sum, product) => sum + (product.units?.length ?? 0), 0)}</h3>
                  <h3 className="text-lg font-semibold">Total Harga: Rp {cart.reduce((total, product) => {
                    const productTotal = product.units?.reduce((unitTotal, unit) => {
                      return unitTotal + (unit.price * unit.quantity);
                    }, 0) || 0;
                    return total + productTotal;
                  }, 0).toLocaleString('id-ID')}</h3>
                </div>
              </div>
            </div>
            <div className="w-6/12 bg-blue-300">
              <h2 className="text-lg font-semibold">Total Price</h2>
            </div>
          </div>
        </Modal>
    </div>
    );
};

export default CheckoutProductModal;