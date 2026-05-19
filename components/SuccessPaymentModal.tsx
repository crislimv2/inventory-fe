"use client";
import { Modal } from "antd";
import { SuccessPaymentModalProps } from "./interfaces/SuccessPaymentModalProps";
import success from "../src/animations/Success.json";
import Lottie from "lottie-react";
import { Printer, Check, X } from "lucide-react";
import { formatRp, formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const SuccessPaymentModal: React.FC<SuccessPaymentModalProps> = ({
  isOpen,
  products,
  onClose,
  totalAmount,
  setIsCheckoutModalOpen,
  setCart,
  paymentMethod,
  cashReceived,
}) => {
  const isCash = paymentMethod === "Cash";
  const change = cashReceived - totalAmount;
  const changeLabel = change >= 0 ? "Kembalian" : "Kurang";

  const totalQuantity = products.reduce((sum, product) => {
    const productTotal =
      product.units?.reduce((unitSum, unit) => unitSum + (unit.quantity || 0), 0) ||
      0;
    return sum + productTotal;
  }, 0);

  const handlePrintReceipt = () => {
    if (!products || products.length === 0) return;

    const printWindow = window.open("", "", "width=300,height=600");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          @media print { @page { margin: 0; size: 80mm auto; } body { width: 80mm; margin: 0 auto; } }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; font-size: 12px; line-height: 1.45; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .small { font-size: 10px; color: #444; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .item-row { margin: 6px 0; }
          .total-section { margin-top: 10px; padding-top: 8px; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div class="center bold large">Toko Ci Ali</div>
        <div class="center small">GRGL PTM · Jakarta Barat</div>
        <div class="row small">
          <span>${formatDate()}</span>
          <span>${formatTime()}</span>
        </div>
        <div class="divider"></div>
        ${products
          .map((item) =>
            (item.units || [])
              .map(
                (unit) => `
            <div class="item-row">
              <div>${item.name} (${unit.unitName})</div>
              <div class="row">
                <span>${unit.quantity} x ${formatRp(unit.price)}</span>
                <span class="bold">${formatRp(unit.price * unit.quantity)}</span>
              </div>
            </div>
          `,
              )
              .join(""),
          )
          .join("")}
        <div class="divider"></div>
        <div class="small">QTY: ${totalQuantity}</div>
        <div class="row bold large total-section">
          <span>TOTAL</span>
          <span>${formatRp(totalAmount)}</span>
        </div>
        ${
          isCash
            ? `
          <div class="row"><span>Bayar</span><span>${formatRp(cashReceived)}</span></div>
          <div class="row"><span>${changeLabel}</span><span>${formatRp(Math.abs(change))}</span></div>
        `
            : ""
        }
        <div class="divider"></div>
        <div class="center">Pembayaran: ${paymentMethod?.toUpperCase()}</div>
        <div class="center" style="margin-top: 10px;">Terima kasih!</div>
      </body>
      </html>
    `;

    const doc = printWindow.document;
    doc.open();
    doc.close();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(receiptHTML, "text/html");
    doc.replaceChild(doc.importNode(newDoc.documentElement, true), doc.documentElement);
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDone = () => {
    setCart([]);
    setIsCheckoutModalOpen(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      maskClosable={false}
      footer={null}
      centered
      width={460}
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      <div className="flex flex-col">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="h-24 w-24 rounded-full bg-success-soft flex items-center justify-center">
            <Lottie
              animationData={success}
              loop={false}
              style={{ width: 100, height: 100 }}
            />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mt-3">
            Pembayaran Berhasil
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Transaksi via {paymentMethod} telah diselesaikan.
          </p>
        </div>

        {/* Receipt-style summary */}
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tnum">{formatRp(totalAmount)}</span>
          </div>
          {isCash && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diterima</span>
                <span className="font-medium tnum">{formatRp(cashReceived)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="text-sm font-medium">{changeLabel}</span>
                <span
                  className={cn(
                    "text-2xl font-semibold tnum tracking-tight",
                    change >= 0 ? "text-success" : "text-warning-foreground",
                  )}
                >
                  {formatRp(Math.abs(change))}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            <span>{formatDate()}</span>
            <span>{formatTime()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="h-12 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down inline-flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 press-down inline-flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessPaymentModal;
