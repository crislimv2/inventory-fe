"use client";
import { useMemo, useState } from "react";
import { Modal } from "antd";
import { Check, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { Transaction, TransactionLine } from "@/lib/store/types";
import {
  commitRefund,
  linesOf,
} from "@/lib/store/repos/transactions";
import { usePos } from "@/lib/store/usePos";

type Props = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onRefunded?: () => void;
};

export function RefundModal({
  isOpen,
  transaction,
  onClose,
  onRefunded,
}: Props) {
  const afterSaleCommit = usePos((s) => s.afterSaleCommit);

  const lines: TransactionLine[] = useMemo(
    () => (transaction ? linesOf(transaction.id) : []),
    [transaction],
  );
  const [refundQuantities, setRefundQuantities] = useState<
    Record<string, number>
  >({});
  const [prevTxId, setPrevTxId] = useState<string | null>(
    transaction?.id ?? null,
  );

  const currentTxId = transaction?.id ?? null;
  if (currentTxId !== prevTxId) {
    setPrevTxId(currentTxId);
    setRefundQuantities({});
  }

  const positiveLines = lines.filter((l) => l.quantity > 0);

  const refundTotal = positiveLines.reduce((s, l) => {
    const q = refundQuantities[l.id] ?? 0;
    return s + l.price * q;
  }, 0);

  const anySelected = Object.values(refundQuantities).some((q) => q > 0);

  const handleRefund = () => {
    if (!transaction || !anySelected) return;
    try {
      commitRefund({
        originalId: transaction.id,
        refundQuantities,
      });
      afterSaleCommit();
      toast.success("Refund berhasil diproses");
      onRefunded?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Refund gagal diproses");
    }
  };

  if (!transaction) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={580}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Refund Transaksi
          </h2>
          <p className="text-xs text-muted-foreground tnum">
            {transaction.code}
          </p>
        </div>

        <ul className="rounded-xl border border-border bg-card divide-y divide-border max-h-[360px] overflow-auto">
          {positiveLines.map((line) => {
            const max = line.quantity;
            const value = refundQuantities[line.id] ?? 0;
            return (
              <li key={line.id} className="px-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {line.productName}
                    </p>
                    <p className="text-xs text-muted-foreground tnum">
                      {line.unitName} · {formatRp(line.price)} × {line.quantity}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-lg border border-border bg-background">
                    <button
                      type="button"
                      onClick={() =>
                        setRefundQuantities((p) => ({
                          ...p,
                          [line.id]: Math.max(0, value - 1),
                        }))
                      }
                      className="h-8 w-8 inline-flex items-center justify-center rounded-l-lg hover:bg-accent"
                      aria-label="Kurangi"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold tnum">
                      {value}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRefundQuantities((p) => ({
                          ...p,
                          [line.id]: Math.min(max, value + 1),
                        }))
                      }
                      className="h-8 w-8 inline-flex items-center justify-center rounded-r-lg hover:bg-accent"
                      aria-label="Tambah"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border px-4 py-3">
          <span className="text-sm font-medium">Total refund</span>
          <span className="text-2xl font-semibold tnum tracking-tight">
            {formatRp(refundTotal)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="col-span-1 h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleRefund}
            disabled={!anySelected}
            className={cn(
              "col-span-2 h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
              "bg-foreground text-background hover:bg-foreground/90",
              "disabled:opacity-50",
            )}
          >
            <Check className="h-4 w-4" />
            Proses Refund
          </button>
        </div>
      </div>
    </Modal>
  );
}
