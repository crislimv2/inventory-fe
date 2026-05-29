"use client";
import { useMemo, useState } from "react";
import { Modal } from "antd";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePos, stockOf } from "@/lib/store/usePos";
import { recordMovement } from "@/lib/store/stockOps";

const REASONS: { value: "adjustment" | "purchase" | "audit"; label: string }[] =
  [
    { value: "adjustment", label: "Penyesuaian" },
    { value: "purchase", label: "Pembelian" },
    { value: "audit", label: "Audit Stok" },
  ];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productUnitId?: string | null;
};

export function AdjustmentModal({ isOpen, onClose, productUnitId }: Props) {
  const products = usePos((s) => s.products);
  const units = usePos((s) => s.units);
  const stockState = usePos((s) => s.stock);
  const refreshCatalog = usePos((s) => s.refreshCatalog);

  const [unitId, setUnitId] = useState<string>(productUnitId ?? "");
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<"adjustment" | "purchase" | "audit">(
    "adjustment",
  );
  const [note, setNote] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setUnitId(productUnitId ?? "");
    setDelta(0);
    setReason("adjustment");
    setNote("");
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const sortedOptions = useMemo(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    return units
      .map((u) => {
        const product = productById.get(u.productId);
        return {
          id: u.id,
          label: `${product?.name ?? "—"} · ${u.unitName}`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products, units]);

  const currentStock = unitId ? stockOf({ stock: stockState }, unitId) : 0;
  const newStock = currentStock + delta;
  const canSubmit = unitId && delta !== 0 && newStock >= 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    recordMovement({
      productUnitId: unitId,
      delta,
      reason,
      note: note.trim() || undefined,
    });
    refreshCatalog();
    toast.success("Stok diperbarui");
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Penyesuaian Stok
          </h2>
          <p className="text-xs text-muted-foreground">
            Catat perubahan stok secara manual dengan alasan.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Satuan Produk
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
            >
              <option value="">— Pilih satuan —</option>
              {sortedOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Perubahan Stok (±)
              </label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value) || 0)}
                placeholder="Mis. 10 atau -5"
                className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Alasan
              </label>
              <select
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value as "adjustment" | "purchase" | "audit",
                  )
                }
                className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Catatan (opsional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Mis. Rusak, kadaluarsa, koreksi opname"
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
            />
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 border border-border p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Stok saat ini
            </p>
            <p className="text-lg font-semibold tnum">{currentStock}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Setelah penyesuaian
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tnum tracking-tight",
                newStock < 0 && "text-destructive",
              )}
            >
              {newStock}
            </p>
          </div>
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "col-span-2 h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
              "bg-foreground text-background hover:bg-foreground/90",
              "disabled:opacity-50",
            )}
          >
            <Check className="h-4 w-4" />
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
}
