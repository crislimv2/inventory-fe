import React, { useEffect, useState } from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { InputNumber, Modal, QRCode, Segmented } from "antd";
import { AlertCircle, CircleAlert, CreditCard, QrCode, Trash2Icon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRIS_CODE from "@/const/qr_code";
import Image from "next/image";

const CheckoutProductModal : React.FC<CheckoutProductModalProps> = ({ isOpen, onClose, cart, setCart }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit'>('Cash');
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const total = cart.reduce((total, product) => {
      const productTotal = product.units?.reduce((unitTotal, unit) => {
        return unitTotal + (unit.price * unit.quantity);
      }, 0) || 0;
      return total + productTotal;
    }, 0);
    setTotalAmount(total);
  }, [cart]);

  let idx = 0;
  const handleRemoveItem = (productId: string, unitId: string) => {
    setCart(prevCart => {
      return prevCart.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            units: product.units?.filter(unit => unit.id !== unitId)
          };
        }
        return product;
      });
    });
  };

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
                                  <p className=" font-semibold">Rp {Number(unit.price).toLocaleString('id-ID')}</p>
                                </div>  
                              </div>
                              <button 
                                className="w-1/12 bg-red-500 flex justify-center items-center rounded-r-md hover:cursor-pointer"
                                onClick={() => handleRemoveItem(product.id, unit.id)}
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
            <div className="w-6/12">
              <h2 className="text-lg font-semibold mb-2">Pembayaran</h2>
              <div className="flex items-center w-full">
                <Segmented
                  options={[{
                    label: (
                      <div 
                        className="flex flex-row items-center justify-center font-medium gap-2 px-4"
                      >
                        <Wallet size={20} />
                        <p>Cash</p>
                      </div>
                    ),
                    value: 'Cash'
                  }, {
                    label: (
                      <div 
                        className="flex flex-row items-center justify-center  font-medium gap-2 px-4"
                      >
                        <QrCode size={20} />
                        <p>QRIS</p>
                      </div>
                    ),
                    value: 'QRIS'
                  }, {
                    label: (
                      <div 
                        className="flex flex-row items-center justify-center font-medium gap-2 px-4"
                      >
                        <CreditCard size={20} />
                        <p>Debit</p>
                      </div>
                    ),
                    value: 'Debit'
                  }]}
                  className="w-full [&_.ant-segmented-item]:flex-1"
                  size="large"
                  value={paymentMethod}
                  onChange={(val) => {
                    setPaymentMethod(val as 'Cash' | 'QRIS' | 'Debit');
                    setCashReceived(null);
                  }}
                />
              </div>

              <div>
                {paymentMethod === 'Cash' && (
                  <div className="mt-4 w-full">
                    <h3 className="text-md font-semibold">Cash diterima:</h3>
                    <InputNumber
                      style={{width:'100%'}}
                      value={cashReceived}
                      onChange={(value) => setCashReceived(value)}
                      controls={false}
                      formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      size="middle"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="cursor-pointer hover:bg-[#7C3BED] hover:text-white" onClick={() => setCashReceived(50000)}>Rp. 50.000</Button>
                      <Button variant="outline" className="cursor-pointer hover:bg-[#7C3BED] hover:text-white" onClick={() => setCashReceived(100000)}>Rp. 100.000</Button>
                      <Button variant="outline" className="cursor-pointer hover:bg-[#7C3BED] hover:text-white" onClick={() => setCashReceived(200000)}>Rp. 200.000</Button>
                      <Button variant="outline" className="cursor-pointer hover:bg-[#7C3BED] hover:text-white" onClick={() => setCashReceived(500000)}>Rp. 500.000</Button>
                    </div>

                    <div className="flex bg-white justify-between p-3 mt-3 border-2 rounded-lg"> 
                      {cashReceived  != null && cashReceived < totalAmount && (
                        <>
                          <div className=" flex flex-row gap-3 items-center">
                            <AlertCircle color="#F59F60" size={25} />
                            <p className="text-lg font-medium text-[#F59F60]">Jumlah Kurang</p>
                          </div>
                          <div>
                            <p className="text-md font-medium px-4 p-2 bg-red-500 rounded-xl text-white">Rp {((cashReceived ?? 0) - totalAmount).toLocaleString('id-ID')}</p>
                          </div>
                        </>
                      )}

                      {cashReceived != null && cashReceived >= totalAmount && (
                        <>
                          <div className=" flex flex-row gap-3 items-center">
                            <CircleAlert color="#22C55E" size={25} />
                            <p className="text-lg font-medium text-[#22C55E]">Kembalian</p>
                          </div>
                          <div>
                            <p className="text-md font-medium px-4 p-2 bg-green-500 rounded-xl text-white">Rp {(cashReceived - totalAmount).toLocaleString('id-ID')}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {(paymentMethod === 'QRIS') && (
                  <div className="mt-4 flex flex-col">
                    <div className="flex justify-center flex-col items-center mt-3 gap-4">
                      <div className="w-10/12 text-center">
                        <h1 className="font-bold text-lg">Toko Ci Ali, GRGL PTM</h1>
                        <span className="text-sm text-black opacity-50">Jl. Jelambar Jaya 4 No. 18, RT.8/RW.3, Jelambar Baru, Kecamatan Grogol Petamburan, Kota Jakarta Barat,  Daerah Khusus Ibukota Jakarta</span>
                      </div>
                      <div className="border-2 rounded-lg flex items-center flex-col w-5/12 pb-6 text-center align-items-center ">
                        <Image
                          src="/qris_icon.jpg"
                          width={100}
                          height={100}
                          alt="example"
                          className=""
                          draggable={false}
                        />
                        <h1 className="text-lg font-semibold flex items-center gap-1">
                          <span className="text-gray-600 text-md font-semibold">Rp</span>
                          {Number(totalAmount).toLocaleString('id-ID')}
                        </h1>
                        <div className="flex justify-center w-full relative">
                          <div className="relative inline-block p-5 shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-lg">
                            {/* Frame merah */}
                            <Image
                              src="/frame_qris.png"
                              width={220}
                              height={220}
                              alt="frame"
                              className="absolute top-0 left-0 z-0 rounded-lg"
                              draggable={false}
                            />

                            {/* QR Code dengan jarak dari frame */}
                            <div className="relative z-10 bg-white rounded-lg border-0">
                              <QRCode type="canvas" value={QRIS_CODE} size={180} className="!border-0 !rounded-none"/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </Modal>
    </div>
    );
};

export default CheckoutProductModal;