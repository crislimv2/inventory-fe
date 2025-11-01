import React, { useEffect, useState } from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { InputNumber, Modal, QRCode, Segmented } from "antd";
import type { InputNumberProps } from "antd";
import { AlertCircle, CheckCircle2, Download, LoaderCircleIcon, QrCode, Trash2Icon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRIS_CODE from "@/const/qr_code";
import Image from "next/image";
import handleQRIS from "@/utils/handleQRIS";
import SuccessPaymentModal from "./SuccessPaymentModal";
import QRCodeButton from "qrcode";


const CheckoutProductModal : React.FC<CheckoutProductModalProps> = ({ isOpen, onClose, cart, setCart, setIsCheckoutModalOpen }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit'>('Cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const amountButtons = [10000, 20000, 50000, 70000, 100000, 150000, 200000, 250000, 500000];
  const [qrisLoading, setQrisLoading] = useState<boolean>(true);
  const [qrisData, setQrisData] = useState<string>(QRIS_CODE);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const total = cart.reduce((total, product) => {
      const productTotal = product.units?.reduce((unitTotal, unit) => {
        return unitTotal + (unit.price * unit.quantity);
      }, 0) || 0;
      return total + productTotal;
    }, 0);
    setTotalAmount(total);
  }, [cart]);

  useEffect(() => {
    setQrisLoading(true);
  }, [totalAmount, paymentMethod]);

  const handleQrisRefresh = async () => {
    try {
      // const response = await fetch(`https://api-mininxd.vercel.app/qris?qris=${QRIS_CODE}&nominal=${totalAmount}`);
      // const data = await response.json();
      // setQrisData(data.QR);
      const qris = handleQRIS("ID10254493976740303UMI", totalAmount);
      setQrisData(qris);
    } catch (error) {
      console.error("Error fetching QRIS data:", error);
    } finally {
      setQrisLoading(false);
    }
  };

  const handleDownloadQRIS = async () => {
    try {
      const newQris = handleQRIS("ID10254493976740303UMI", totalAmount);
      setQrisData(newQris);

      const qrPng = await QRCodeButton.toDataURL(newQris);
      const link = document.createElement("a");
      link.href = qrPng;
      link.download = "qris.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download QR:", err);
    } finally {
      setQrisLoading(false);
    }
  };


  const handleQrisStatus = () => {
    if(totalAmount <= 0) return "expired";
    return qrisLoading ? "expired" : "active";
  };

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

  const formatter: InputNumberProps<number>["formatter"] = (value) => {
    if (!value && value !== 0) return "";
    const parts = value.toString().split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts[1] ? `.${parts[1]}` : "";
    return `Rp ${integerPart}${decimalPart}`;
  };

  // --- Parser: Convert from "Rp 20.000.000" -> 20000000 ---
  const parser: InputNumberProps<number>["parser"] = (value) => {
    if (!value) return 0;
    const numeric = value.replace(/[Rp\s.]/g, ""); // remove Rp, spaces, and dots
    return Number(numeric);
  };

  const onChange: InputNumberProps<number>["onChange"] = (value) => {
    setCashReceived(value ?? 0);
  };

  return (
    <div>
        <Modal
          width={1350}
          open={isOpen}
          onCancel={onClose}
          maskClosable={false}
          footer={null}
          className={isSuccessModalOpen ? "blur-sm" : ""}
          styles={{
            content: {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Checkout</h2>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-6/12 ">
              <div className="">
                <div className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                  <h3 className="font-bold text-lg text-[#7C3BED] mr-3">{cart.reduce((acc, product) => acc + (product.units?.reduce((acc, unit) => acc + unit.quantity, 0) || 0), 0)} Items</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-lg overflow-y-auto h-[550px] border ">
                    {cart.map((product) => (
                      <div key={product.id}>
                        {product.units?.map((unit) => {
                          idx++;
                          return (
                            <div key={unit.id} className="px-1 flex flex-col justify-start border-t">
                              <div className="flex justify-between w-full px-1 py-2">
                                <div className="w-1/12 flex justify-center items-center">
                                  <div className="w-8.5 h-8.5 flex justify-center items-center rounded-full bg-[#ECE6F9]">
                                    <h1 className="text-[#7C3BED] font-extrabold">{idx}</h1>
                                  </div>
                                </div>
                                <div className="w-11/12 flex flex-row">
                                  <div className="w-11/12 flex flex-row items-center px-2">
                                    <div className="w-10/12 flex flex-col">
                                      <div className="flex gap-1 items-center flex-row font-semibold flex-wrap">
                                        <p className="text-md">{product.name}</p>
                                        <p className="text-sm">({unit.unitName})</p>
                                      </div>
                                      <div className="flex flex-row w-full justify-between">
                                        <div className="flex flex-row items-center opacity-50 font-medium">
                                          <p>{unit.quantity}</p>
                                          <p className="mx-2">x</p>
                                          <p>Rp {Number(unit.price).toLocaleString('id-ID')}</p>
                                        </div>
                                      </div>  
                                    </div>
                                    <div className="w-2/12 flex justify-end">
                                        <p className=" font-semibold">Rp {Number(unit.price).toLocaleString('id-ID')}</p>
                                    </div>
                                  </div>
                                  <div className="w-1/12">
                                    <div className="w-full h-full flex justify-center items-center rounded-xl">
                                      <button 
                                        className=" bg-red-500 flex justify-center items-center rounded-xl hover:cursor-pointer p-2 hover:p-3"
                                        onClick={() => handleRemoveItem(product.id, unit.id)}
                                      >
                                        <Trash2Icon color="#ffffff" size={20}/>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="border p-3 flex flex-row justify-between rounded-lg bg-white">
                    {/* <h3 className="text-lg font-semibold">Total Items: {cart.reduce((sum, product) => sum + (product.units?.length ?? 0), 0)}</h3> */}
                    <h3 className="text-lg font-semibold">Total</h3>
                    <h3 className="text-xl font-bold  text-[#7C3BED]">
                      Rp {cart.reduce((total, product) => {
                        const productTotal = product.units?.reduce((unitTotal, unit) => {
                          return unitTotal + (unit.price * unit.quantity);
                        }, 0) || 0;
                        return total + productTotal;
                      }, 0).toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-6/12">
              <h2 className="text-lg font-semibold mb-2">Pembayaran</h2>  
              <div className="flex flex-col h-[550px]">
                <div className="flex items-center justify-center w-full">
                  <Segmented
                    options={[{
                      label: (
                        <div 
                          className="flex items-center justify-center font-medium flex-col sm:flex-col lg:flex-row gap-2 sm:gap-1"
                        >
                          <Wallet size={22} />
                          <span>Cash</span>
                        </div>
                      ),
                      value: 'Cash'
                    }, {
                      label: (
                        <div 
                          className="flex items-center justify-center font-medium flex-col sm:flex-col lg:flex-row gap-2 sm:gap-1"
                        >
                          <QrCode size={22}/>
                          <span className="">QRIS</span>
                        </div>
                      ),
                      value: 'QRIS'
                    }]}
                    className="w-full [&_.ant-segmented-item]:flex-1 shadow-[0_0_20px_rgba(0,0,0,0.15)]"
                    size="large"
                    value={paymentMethod}
                    onChange={(val) => {
                      setPaymentMethod(val as 'Cash' | 'QRIS' | 'Debit');
                      setCashReceived(0);
                      setSelectedAmount(null);
                    }}
                  />
                </div>

                <div>
                  {paymentMethod === 'Cash' && (
                    <div className="mt-4 w-full">
                      <h3 className="text-md font-semibold">Cash diterima:</h3>
                      <InputNumber<number>
                        style={{ width: '100%' }}
                        value={cashReceived}
                        onClick={() => setSelectedAmount(null)}
                        onChange={(value) => {
                          onChange(value);
                          setSelectedAmount(null);
                        }}
                        controls={false}
                        placeholder="Masukkan jumlah cash diterima"
                        size="large"
                        formatter={formatter}
                        parser={parser}
                      />
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {amountButtons.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            className={`cursor-pointer hover:bg-[#7C3BED] hover:text-white ${
                              selectedAmount === amount ? 'bg-[#7C3BED] text-white' : ''
                            }`}
                            onClick={() => {
                              setCashReceived(amount);
                              setSelectedAmount(amount);
                            }}
                          >
                            Rp. {amount.toLocaleString('id-ID')}
                          </Button>
                        ))}
                      </div>

                      {cashReceived != null && (
                        <div className={`flex justify-between p-3 mt-3 border-2 rounded-lg bg-white 
                          ${cashReceived < totalAmount ? 'border-amber-600/40' : 'border-green-500/40'}`}
                        >
                          {cashReceived < totalAmount && (
                            <div className="flex flex-col w-full gap-3 p-1">
                              <div className=" flex flex-row gap-2 items-center">
                                <AlertCircle color="#F59F60" size={20} />
                                <p className="text-lg font-medium text-[#F6A71D]">Jumlah Kurang</p>
                              </div>
                              <div className="border-t"></div>
                              <div className="flex justify-end">
                                <p className="text-lg font-bold text-[#F6A71D]">Rp. {((cashReceived ?? 0) - totalAmount).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                          )}

                          {cashReceived >= totalAmount && (
                            <div className="flex flex-col w-full gap-3 p-1">
                              <div className=" flex flex-row gap-2 items-center">
                                <CheckCircle2 color="#22C55E" size={20} />
                                <p className="text-lg font-medium text-[#22C55E]">Kembalian</p>
                              </div>
                              <div className="border-t"></div>
                              <div className="flex justify-end">
                                <p className="text-lg font-bold text-[#21C45D]">Rp {(cashReceived - totalAmount).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {(paymentMethod === 'QRIS') && (
                    <div className="mt-4 flex flex-col">
                      <div className="flex justify-center flex-col items-center mt-3 gap-4">
                        <div className="w-10/12 text-center">
                          <h1 className="font-bold text-lg">Toko Ci Ali, GRGL PTM</h1>
                          <span className="text-sm text-black opacity-50">Jl. Jelambar Jaya 4 No. 18, RT.8/RW.3, Jelambar Baru, Kecamatan Grogol Petamburan, Kota Jakarta Barat,  Daerah Khusus Ibukota Jakarta</span>
                        </div>
                        <div className="rounded-lg flex items-center py-3 flex-col min-w-[280px] text-center align-items-center bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)]">
                          <Image
                            src="/qris_icon.jpg"
                            width={100}
                            height={100}
                            alt="example"
                            className=""
                            draggable={false}
                          />
                          <h1 className="text-lg font-semibold flex items-center gap-1">
                            <span className="text-gray-600 text-md font-bold">Rp</span>
                            {Number(totalAmount).toLocaleString('id-ID')}
                          </h1>
                          <div className="flex justify-center w-full relative">
                            <div className="relative inline-block p-5 shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-lg">
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
                                <QRCode type="canvas" value={qrisData} onRefresh={() => handleQrisRefresh()} status={handleQrisStatus()} size={180} className="border-0! rounded-none!"/>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              className="mt-3 mb-1 w-8 h-8 hover:cursor-pointer bg-white"
                              onClick={async () => await handleDownloadQRIS()}
                            >
                              <Download />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end items-end w-full">
                <Button 
                  className="w-7/12 bg-[#7C3BED] hover:bg-[#7C3BED] text-white font-bold py-5 rounded-lg shadow-lg hover:cursor-pointer mt-5"
                  onClick={() => {
                    setIsSuccessModalOpen(true);
                  }}
                >
                  {isSuccessModalOpen ? <LoaderCircleIcon className="animate-spin" size={24} /> : "Confirm Payment"}
                </Button>
              </div>


            </div>
          </div>
        </Modal>
        <SuccessPaymentModal 
          isOpen={isSuccessModalOpen} 
          paymentMethod={paymentMethod}
          onClose={() => {
            onClose();
            setIsSuccessModalOpen(false);
          }} 
          products={cart} 
          setCart={setCart}
          totalAmount={totalAmount} 
          setIsCheckoutModalOpen={setIsCheckoutModalOpen}
          cashReceived={cashReceived}
        />
    </div>
    );
};

export default CheckoutProductModal;