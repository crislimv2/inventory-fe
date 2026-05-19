"use client";
import { InputNumber, Modal } from "antd";
import { SelectedProductModalProps } from "./interfaces/SelectedProductModalProps";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Product } from "./interfaces/Product";
import { useMemo, useState } from "react";
import Image from "next/image";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";

const buildDraft = (product: Product | null): Product | null =>
  product
    ? {
        ...product,
        units: product.units?.map((u) => ({ ...u, quantity: 0 })) ?? [],
      }
    : null;

const SelectedProductModal: React.FC<SelectedProductModalProps> = ({
  isOpen,
  product,
  onClose,
  setCart,
}) => {
  const [draft, setDraft] = useState<Product | null>(() => buildDraft(product));
  const [prevProductId, setPrevProductId] = useState<string | null>(
    product?.id ?? null,
  );

  const currentId = product?.id ?? null;
  if (currentId !== prevProductId) {
    setPrevProductId(currentId);
    setDraft(buildDraft(product));
  }

  const totalPrice = useMemo(
    () =>
      draft?.units?.reduce(
        (sum, u) => sum + (u.price || 0) * (u.quantity || 0),
        0,
      ) ?? 0,
    [draft],
  );

  const totalQty = useMemo(
    () => draft?.units?.reduce((sum, u) => sum + (u.quantity || 0), 0) ?? 0,
    [draft],
  );

  const setQty = (unitId: string, delta: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        units: prev.units?.map((u) =>
          u.id === unitId
            ? { ...u, quantity: Math.max(0, (u.quantity || 0) + delta) }
            : u,
        ),
      };
    });
  };

  const setPrice = (unitId: string, value: number | null) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        units: prev.units?.map((u) =>
          u.id === unitId ? { ...u, price: value ?? 0 } : u,
        ),
      };
    });
  };

  const handleAddToCart = () => {
    if (!draft || totalQty === 0) return;
    const selectedUnits = draft.units?.filter((u) => u.quantity > 0) ?? [];
    const productToAdd: Product = { ...draft, units: selectedUnits };

    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === productToAdd.id);
      if (idx === -1) return [...prev, productToAdd];

      const updated = [...prev];
      const existing = updated[idx];
      const mergedUnits =
        existing.units?.map((u) => {
          const incoming = productToAdd.units?.find((x) => x.id === u.id);
          return incoming
            ? { ...u, quantity: (u.quantity || 0) + incoming.quantity }
            : u;
        }) ?? [];
      const newUnits =
        productToAdd.units?.filter(
          (n) => !mergedUnits.some((m) => m.id === n.id),
        ) ?? [];
      updated[idx] = {
        ...existing,
        units: [...mergedUnits, ...newUnits],
      };
      return updated;
    });
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      {draft ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex gap-4">
            <div className="relative h-28 w-28 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
              <Image
                src="/1rcgKA.jpg"
                fill
                alt={draft.name}
                className="object-cover"
                draggable={false}
                sizes="112px"
              />
            </div>
            <div className="min-w-0 flex-1">
              {draft.category && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                  {draft.category}
                </span>
              )}
              <h2 className="text-xl font-semibold tracking-tight leading-tight">
                {draft.name}
              </h2>
              {draft.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {draft.description}
                </p>
              )}
            </div>
          </div>

          {/* Units */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Pilih satuan</h3>
              <span className="text-[11px] text-muted-foreground">
                {draft.units?.length || 0} pilihan
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {draft.units?.map((unit) => {
                const isActive = (unit.quantity || 0) > 0;
                return (
                  <div
                    key={unit.id}
                    className={cn(
                      "rounded-xl border bg-card p-3 transition-all",
                      isActive
                        ? "border-foreground/30 shadow-card"
                        : "border-border hover:border-foreground/15",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {unit.unitName}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">Rp</span>
                        <InputNumber
                          value={unit.price}
                          onChange={(v) => setPrice(unit.id, v)}
                          controls={false}
                          className="w-28!"
                          size="small"
                          formatter={(v) =>
                            v
                              ? v
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                              : ""
                          }
                          parser={(v) =>
                            Number(v?.replace(/\./g, "") || "0")
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-border bg-background">
                        <button
                          type="button"
                          onClick={() => setQty(unit.id, -1)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-l-lg hover:bg-accent"
                          aria-label="Kurangi"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold tnum">
                          {unit.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(unit.id, 1)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-r-lg hover:bg-accent"
                          aria-label="Tambah"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span
                        className={cn(
                          "text-sm font-semibold tnum",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {formatRp((unit.price || 0) * (unit.quantity || 0))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total + actions */}
          <div className="flex items-center justify-between rounded-xl bg-muted/60 border border-border px-4 py-3">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Subtotal
              </p>
              <p className="text-2xl font-semibold tnum tracking-tight">
                {formatRp(totalPrice)}
              </p>
            </div>
            <span className="text-xs text-muted-foreground tnum">
              {totalQty} qty
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="col-span-1 h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={totalQty === 0}
              className={cn(
                "col-span-2 h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
                "bg-foreground text-background hover:bg-foreground/90",
                "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Memuat produk…</p>
      )}
    </Modal>
  );
};

export default SelectedProductModal;
