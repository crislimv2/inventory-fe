import { Modal } from "antd";
import { Button } from "@/components/ui/button";
import { SuccessPaymentModalProps } from "./interfaces/SuccessPaymentModalProps";
import success from '../src/animations/Success.json';
import Lottie from 'lottie-react';

const SuccessPaymentModal: React.FC<SuccessPaymentModalProps> = ({ isOpen, products, onClose, totalAmount, setIsCheckoutModalOpen, setCart, paymentMethod, cashReceived, setCashReceived }) => {
    const label = cashReceived < totalAmount ? 'Credit' : 'Kembali';
    console.log(cashReceived, totalAmount, label);
    const totalQuantity = products.reduce((sum, product) => {
        const productTotal = product.units?.reduce((unitSum, unit) => unitSum + (unit.quantity || 0), 0) || 0;
        return sum + productTotal;
    }, 0);

    const handlePrintReceipt = () => {
        if (!products || products.length === 0) return;

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
        body {
            width: 80mm;
            margin: 0;
            padding-right: 10mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
        }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 16px; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; page-break-inside: avoid; }
    .item-row { margin: 6px 0; page-break-inside: avoid; }
    .item-name { margin-left: 4px; }
    .total-section { margin-top: 12px; padding-top: 8px; border-top: 2px solid #000; }
    .date-time-row { font-size: 11px; margin-top: 4px; margin-bottom: 4px; }
    .row span:last-child { text-align: right; flex: 1; }
    pre {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.2;
        margin: 0;
        text-align: center;
    }
</style>
</head>
<body>
<div class="center bold large">Toko Ci Ali</div>
<div class="row date-time-row">
    <span>${new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }).format(new Date())}</span>
    <span>${new Date().toLocaleTimeString('id-ID').replaceAll('.', ':')}</span>
</div>
<div>Jenis Pembayaran: ${paymentMethod?.toUpperCase()}</div>
<div class="divider"></div>

${products.map((item) => {
    return item.units?.map((unit) => {
        return `
<div class="item-row">
<div>${item.name} (${unit.unitName})</div>
<div class="row">
<span class="item-name">${unit.quantity} x Rp. ${Number(unit.price).toLocaleString('id-ID')}</span>
<span class="bold">Rp. ${(unit.price * unit.quantity).toLocaleString('id-ID')}</span>
</div>
</div>
        `;
    }).join('');
}).join('')}

<div class="divider"></div>
<div>QTY: ${totalQuantity}</div>
<div class="row bold large total-section">
    <span>TOTAL</span>
    <span>Rp. ${Number(totalAmount).toLocaleString('id-ID')}</span>
</div>

${
    paymentMethod === 'Cash'
    ? `
<div class="row">
<span>Bayar</span>
<span>Rp. ${cashReceived.toLocaleString('id-ID')}</span>
</div>
<div class="row">
<span>${label}</span>
<span>Rp. ${Number(cashReceived - totalAmount).toLocaleString('id-ID')}</span>
</div>
    `
    : ''
}

${
    label === 'Credit'
    ? `
<pre>
-------------------------------------
|    Penjual    |       Pembeli     |
|               |                   |
|               |                   |
|               |                   |
|               |                   |
|               |                   |
|(             )|(                 )|
-------------------------------------
</pre>
    `
    : ''
}


<div class="center" style="margin-top: 12px;">Thank you!</div>
</body>
</html>
`;


        // ✅ Completely avoid document.write()
        const doc = printWindow.document;
        doc.open();
        doc.close();

        // Inject HTML safely
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(receiptHTML, 'text/html');
        doc.replaceChild(doc.importNode(newDoc.documentElement, true), doc.documentElement);

        printWindow.focus();

        // Wait a bit to ensure styles and DOM are loaded before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };



    return (
        <Modal 
            open={isOpen} 
            onCancel={() => {
                onClose();
                setCashReceived(0);
            }}
            maskClosable={false}
            footer={null}
            centered
        >
            <div className="p-4 flex flex-col items-center justify-center text-center gap-4">
                {/* <CheckCircle2 color="#22C55E" size={70} className="animate-bounce" /> */}
                {/* <DotLottieReact
                    src=""
                    autoplay
                /> */}
                <Lottie animationData={success} loop={true} style={{ width: 150, height: 150 }} />
                <h2 className="text-2xl font-semibold">Pembayaran Berhasil</h2>
                <div className="text-gray-600">
                    <span className="text-lg">Your transaction has been completed successfully via {paymentMethod}.</span>
                </div>
                <div className="flex flex-col items-center justify-between w-full">
                    <div className="flex flex-row justify-between items-center w-full">
                        <span className="text-black text-lg font-semibold">Total:</span>
                        <span className="text-lg font-semibold">Rp. {Number(totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full">
                        <span className="text-black text-lg font-semibold">Bayar:</span>
                        {paymentMethod === 'Cash' ? (
                            <span className="text-lg font-semibold">Rp. {Number(cashReceived).toLocaleString('id-ID')}</span>
                        ) : (
                            <span className="text-lg font-semibold">Rp. {Number(totalAmount).toLocaleString('id-ID')}</span>
                        )}
                    </div>
                    {paymentMethod === 'Cash' && (
                        label === 'Kembali' ? (
                            <div className="flex flex-row justify-between items-center w-full">
                                <span className="text-black text-lg font-semibold">Kembali:</span>
                                <span className="text-lg font-semibold">Rp. {Number(cashReceived - totalAmount).toLocaleString('id-ID')}</span>
                            </div>
                        ) : (
                            <div className="flex flex-row justify-between items-center w-full">
                                <span className="text-black text-lg font-semibold">Credit:</span>
                                <span className="text-lg font-semibold">Rp. {Number(cashReceived - totalAmount).toLocaleString('id-ID')}</span>
                            </div>
                        )
                    )}
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
                            setCashReceived(0);
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