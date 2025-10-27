import React from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { Button, Modal } from "antd";
import { Trash2Icon, TrashIcon } from "lucide-react";

const CheckoutProductModal : React.FC<CheckoutProductModalProps> = ({ isOpen, onClose, cart }) => {
  console.log(cart);
  return (
    <div>
        <Modal
          width={1500}
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
                <div className="bg-gray-100 rounded-md">
                  {cart.map((product) => (
                    <div key={product.id} className=" border-gray-400 p-2">
                      {product.units?.map((unit) => (
                        <div key={unit.id} className="mx-1 px-1 py-2">
                          <div className="flex justify-between w-full">
                            <div className="w-11/12 px-3 py-1 bg-gray-300 rounded-l-md">
                              <div className="flex gap-2">
                                <p className="text-md">{product.name}</p>
                                <p className="text-sm">({unit.unitName})</p>
                              </div>
                              <div className="flex flex-row w-full justify-between">
                                <div className="flex flex-row gap-3">
                                  <p>{unit.quantity}</p>
                                  <p>x  Rp {Number(unit.price).toLocaleString('id-ID')}</p>
                                </div>
                                <p className=" font-semibold">Rp {Number(unit.quantity * unit.price).toLocaleString('id-ID')}</p>
                              </div>  
                            </div>
                            <div className="w-1/12 bg-red-500 flex justify-center items-center rounded-r-md">
                              <Trash2Icon color="#ffffff" size={20}/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="p-2">
                    <h3 className="text-md font-semibold">Total Items: {cart.map(item => item.units?.length)}</h3>
                    <h3 className="text-md font-semibold">Total Price: Rp {cart.reduce((total, product) => {
                      const productTotal = product.units?.reduce((unitTotal, unit) => {
                        return unitTotal + (unit.price * unit.quantity);
                      }, 0) || 0;
                      return total + productTotal;
                    }, 0).toLocaleString('id-ID')}</h3>
                  </div>
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