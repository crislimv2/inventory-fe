"use client";
import { Modal } from "antd";
import Lottie from "lottie-react";
import { Check, Printer, X } from "lucide-react";
import success from "../../animations/Success.json";
import { cn } from "@/lib/utils";
import { formatRp, formatDate, formatTime } from "@/lib/format";
import { Transaction } from "@/lib/store/types";
import { linesOf } from "@/lib/store/repos/transactions";
import { usePos } from "@/lib/store/usePos";

type Props = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export function SuccessSheet({ isOpen, transaction, onClose }: Props) {
  const merchant = usePos((s) => s.settings.merchant);

  if (!transaction) return null;
  const isCash = transaction.paymentMethod === "cash";
  const cashReceived = transaction.cashTendered ?? 0;
  const change = transaction.change ?? 0;
  const total = transaction.total;

  const handlePrintReceipt = () => {
    const items = linesOf(transaction.id);
    if (items.length === 0) return;
    const totalQuantity = items.reduce((s, l) => s + l.quantity, 0);

    const printWindow = window.open("", "", "width=300,height=600");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html><head><title>${transaction.code}</title>
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
      </style></head><body>
        <div class="center bold large">${merchant.name}</div>
        ${merchant.address ? `<div class="center small">${merchant.address}</div>` : ""}
        <div class="row small">
          <span>${formatDate(new Date(transaction.occurredAt))}</span>
          <span>${formatTime(new Date(transaction.occurredAt))}</span>
        </div>
        <div class="row small"><span>No. Struk</span><span>${transaction.code}</span></div>
        <div class="divider"></div>
        ${items
          .map(
            (l) => `
          <div class="item-row">
            <div>${l.productName} (${l.unitName})</div>
            <div class="row">
              <span>${l.quantity} x ${formatRp(l.price)}</span>
              <span class="bold">${formatRp(l.lineTotal)}</span>
            </div>
          </div>
        `,
          )
          .join("")}
        <div class="divider"></div>
        <div class="small">QTY: ${totalQuantity}</div>
        <div class="row bold large total-section">
          <span>TOTAL</span>
          <span>${formatRp(total)}</span>
        </div>
        ${
          isCash
            ? `
          <div class="row"><span>Bayar</span><span>${formatRp(cashReceived)}</span></div>
          <div class="row"><span>Kembalian</span><span>${formatRp(change)}</span></div>`
            : ""
        }
        <div class="divider"></div>
        <div class="center">Pembayaran: ${transaction.paymentMethod.toUpperCase()}</div>
        <div class="center" style="margin-top: 10px;">Terima kasih!</div>
      </body></html>
    `;

    const doc = printWindow.document;
    doc.open();
    doc.close();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, "text/html");
    doc.replaceChild(doc.importNode(newDoc.documentElement, true), doc.documentElement);
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
            Transaksi via {transaction.paymentMethod.toUpperCase()} telah
            diselesaikan.
          </p>
          <p className="text-[11px] text-muted-foreground tnum mt-1">
            {transaction.code}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tnum">{formatRp(total)}</span>
          </div>
          {isCash && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diterima</span>
                <span className="font-medium tnum">
                  {formatRp(cashReceived)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="text-sm font-medium">Kembalian</span>
                <span
                  className={cn(
                    "text-2xl font-semibold tnum tracking-tight",
                    change >= 0 ? "text-success" : "text-warning-foreground",
                  )}
                >
                  {formatRp(change)}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            <span>{formatDate(new Date(transaction.occurredAt))}</span>
            <span>{formatTime(new Date(transaction.occurredAt))}</span>
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
            onClick={onClose}
            className="h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 press-down inline-flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
}
