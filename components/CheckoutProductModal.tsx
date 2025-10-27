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
          footer={null}
          className=""
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
          </div>
          {/* Modal content goes here */}
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
                          <div className="flex justify-between">
                            <div className="w-full">
                              <div className="flex gap-2">
                                <p className="text-md">{product.name}</p>
                                <p className="text-sm">({unit.unitName})</p>
                              </div>
                              <div className="flex flex-row w-full justify-between">
                                <div className="flex flex-row gap-5">
                                  <p>{unit.quantity}</p>
                                  <p>x  {unit.price}</p>
                                </div>
                                <p>{unit.quantity * unit.price}</p>
                              </div>  
                            </div>
                            <div className="">
                              <Trash2Icon color="#e25578"/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="p-2">
                    <h3 className="text-md font-semibold">Total Items: {cart.length}</h3>
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