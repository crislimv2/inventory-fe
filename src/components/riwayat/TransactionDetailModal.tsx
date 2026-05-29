"use client";
import { useMemo } from "react";
import { Modal } from "antd";
import { Printer, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRp, formatDate, formatTime } from "@/lib/format";
import { Transaction } from "@/lib/store/types";
import { linesOf } from "@/lib/store/repos/transactions";
import { usePos } from "@/lib/store/usePos";

type Props = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onRefund?: () => void;
};

const STATUS_LABEL: Record<Transaction["status"], string> = {
  paid: "Lunas",
  refunded: "Refund Penuh",
  partially_refunded: "Refund Sebagian",
  void: "Dibatalkan",
};

const PAYMENT_LABEL: Record<Transaction["paymentMethod"], string> = {
  cash: "Tunai",
  qris: "QRIS",
  debit: "Debit",
};

export function TransactionDetailModal({
  isOpen,
  transaction,
  onClose,
  onRefund,
}: Props) {
  const merchant = usePos((s) => s.settings.merchant);

  const lines = useMemo(
    () => (transaction ? linesOf(transaction.id) : []),
    [transaction],
  );

  const handlePrint = () => {
    if (!transaction || lines.length === 0) return;
    const totalQuantity = lines.reduce((s, l) => s + l.quantity, 0);
    const isCash = transaction.paymentMethod === "cash";
    const cashReceived = transaction.cashTendered ?? 0;
    const change = transaction.change ?? 0;

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
        ${lines
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
          <span>${formatRp(transaction.total)}</span>
        </div>
        ${
          isCash
            ? `
          <div class="row"><span>Bayar</span><span>${formatRp(cashReceived)}</span></div>
          <div class="row"><span>Kembalian</span><span>${formatRp(change)}</span></div>`
            : ""
        }
        <div class="divider"></div>
        <div class="center">Pembayaran: ${PAYMENT_LABEL[transaction.paymentMethod].toUpperCase()}</div>
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

  if (!transaction) return null;
  const canRefund = transaction.total > 0 && transaction.status !== "refunded";
  const isRefundEntry = transaction.refundOfId != null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {isRefundEntry ? "Refund" : "Transaksi"}
            </p>
            <h2 className="text-xl font-semibold tracking-tight tnum">
              {transaction.code}
            </h2>
            <p className="text-xs text-muted-foreground tnum">
              {formatDate(new Date(transaction.occurredAt))} ·{" "}
              {formatTime(new Date(transaction.occurredAt))}
            </p>
          </div>
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold",
              transaction.status === "paid"
                ? "bg-success-soft text-success"
                : transaction.status === "partially_refunded"
                  ? "bg-warning-soft text-warning-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {STATUS_LABEL[transaction.status]}
          </span>
        </div>

        <ul className="rounded-xl border border-border bg-card divide-y divide-border max-h-[300px] overflow-auto">
          {lines.map((line) => (
            <li
              key={line.id}
              className="px-3 py-2.5 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {line.productName}
                </p>
                <p className="text-xs text-muted-foreground tnum">
                  {line.quantity} {line.unitName} × {formatRp(line.price)}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold tnum",
                  line.lineTotal < 0 && "text-destructive",
                )}
              >
                {formatRp(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tnum">
              {formatRp(transaction.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-border">
            <span className="text-sm font-medium">
              {isRefundEntry ? "Refund" : "Total"}
            </span>
            <span
              className={cn(
                "text-2xl font-semibold tnum tracking-tight",
                transaction.total < 0 && "text-destructive",
              )}
            >
              {formatRp(transaction.total)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Metode: {PAYMENT_LABEL[transaction.paymentMethod]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down inline-flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak Ulang
          </button>
          <button
            type="button"
            onClick={onRefund}
            disabled={!canRefund}
            className={cn(
              "h-11 rounded-xl border text-sm font-medium press-down inline-flex items-center justify-center gap-2 transition-colors",
              canRefund
                ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                : "border-border bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <Undo2 className="h-4 w-4" />
            Refund
          </button>
        </div>
      </div>
    </Modal>
  );
}
