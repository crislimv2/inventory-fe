import { Modal } from "antd";
import { Button } from "@/components/ui/button";
import { SuccessPaymentModalProps } from "./interfaces/SuccessPaymentModalProps";
import { CheckCircle2 } from "lucide-react";

const SuccessPaymentModal: React.FC<SuccessPaymentModalProps> = ({ isOpen, products, onClose, totalAmount, setIsCheckoutModalOpen, setCart, paymentMethod, cashReceived }) => {
    let index = 0;
    const label = cashReceived <= totalAmount ? 'Credit' : 'Change';
    const handlePrintReceipt = () => {
        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt</title>
                <style>
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Courier New', monospace;
                    width: 80mm;
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.4;
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .large { font-size: 16px; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; margin: 4px 0; }
                .item-row { margin: 6px 0; }
                .total-section { margin-top: 12px; padding-top: 8px; border-top: 2px solid #000; }
                </style>
            </head>
            <body>
                <div class="center bold large">RECEIPT</div>
                <div class="center">${new Date().toLocaleString('id-ID')}</div>
                <div class="divider"></div>
                ${products.map((item) => {
                return item.units?.map((unit) => {
                    index++;
                    return `
                    <div>${index}. ${item.name} (${unit.unitName})</div>
                    <div class="row">
                        <span>${unit.quantity} x Rp. ${Number(unit.price).toLocaleString('id-ID')}</span>
                        <span class="bold">Rp. ${(unit.price * unit.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    `;
                }).join('');
                }).join('')}
                <div class="divider"></div>
                <div class="row bold large total-section">
                    <span>TOTAL</span>
                    <span>Rp. ${Number(totalAmount).toLocaleString('id-ID')}</span>
                </div>
                ${paymentMethod === 'Cash' ? `
                    <div class="row">
                        <span>Cash</span>
                        <span>Rp. ${cashReceived.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="row">
                        <span>${label}</span>
                        <span>Rp. ${Number(cashReceived - totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                ` : ''}
                <div class="divider"></div>
                <div class="center">Payment: ${paymentMethod.toUpperCase()}</div>
                <div class="center" style="margin-top: 12px;">Thank you!</div>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };


    return (
        <Modal 
            open={isOpen} 
            onCancel={onClose}
            maskClosable={false}
            footer={null}
            centered
        >
            <div className="p-4 flex flex-col items-center justify-center text-center gap-4">
                <CheckCircle2 color="#22C55E" size={70} className="animate-bounce" />
                <h2 className="text-2xl font-semibold">Pembayaran Berhasil</h2>
                <div className="text-gray-600">
                    <span className="text-lg">Your transaction has been completed successfully via {paymentMethod}.</span>
                </div>
                <div className="mt-1">
                    <span className="text-black text-lg font-semibold">Total: Rp. {Number(totalAmount).toLocaleString('id-ID')}</span>
                </div>
            </div>
            <div className="mt-1">
                <div className="w-full flex flex-col sm:flex-row items-center justify-center text-center gap-2 my-2">
                    <Button
                        style={{paddingBlock: '1.3rem'}}
                        className="min-w-6/12 bg-white hover:bg-[#7C3BED] text-black border border-gray-400/40 hover:text-white font-semibold hover:cursor-pointer"
                        onClick={() => {
                            handlePrintReceipt();
                        }}
                    >
                        Print Receipt
                    </Button>
                    <Button
                        style={{paddingBlock: '1.3rem'}}
                        className="min-w-6/12 bg-[#7C3BED] hover:bg-[#8c52ef] text-white font-semibold hover:cursor-pointer"
                        onClick={() => {
                            setCart([]);
                            setIsCheckoutModalOpen(false);
                            onClose();
                        }}
                    >
                        Selesai
                    </Button>

                </div>
            </div>
        </Modal>
    );
};

export default SuccessPaymentModal;