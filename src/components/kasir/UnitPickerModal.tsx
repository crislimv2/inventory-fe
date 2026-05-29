"use client";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Modal } from "antd";
import { Check, Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { UnitArtwork } from "@/components/UnitArtwork";
import { Product, ProductUnit } from "@/lib/store/types";
import { usePos, stockOf, unitsOf } from "@/lib/store/usePos";

type Props = {
  isOpen: boolean;
  productId: string | null;
  onClose: () => void;
};

export function UnitPickerModal({ isOpen, productId, onClose }: Props) {
  const product = usePos(
    useShallow((s) =>
      productId ? s.products.find((p) => p.id === productId) ?? null : null,
    ),
  );
  const units = usePos(
    useShallow((s) =>
      productId ? unitsOf({ units: s.units }, productId) : [],
    ),
  );
  const stockState = usePos((s) => s.stock);
  const cart = usePos((s) => s.cart);
  const addToCart = usePos((s) => s.addToCart);

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [prevProductId, setPrevProductId] = useState<string | null>(null);

  // Reset on product change (React 19 prop-sync pattern).
  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setSelectedUnitId(units[0]?.id ?? null);
    setQuantity(1);
  }

  const selectedUnit: ProductUnit | null = useMemo(
    () => units.find((u) => u.id === selectedUnitId) ?? units[0] ?? null,
    [units, selectedUnitId],
  );

  const cartQtyByUnit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cart) {
      if (c.productId === productId) map[c.productUnitId] = c.quantity;
    }
    return map;
  }, [cart, productId]);

  const stockByUnit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of units) map[u.id] = stockOf({ stock: stockState }, u.id);
    return map;
  }, [stockState, units]);

  const selectedStock = selectedUnit ? stockByUnit[selectedUnit.id] ?? 0 : 0;
  const selectedCartQty = selectedUnit
    ? cartQtyByUnit[selectedUnit.id] ?? 0
    : 0;
  const remaining = Math.max(0, selectedStock - selectedCartQty);
  const lineTotal = (selectedUnit?.price ?? 0) * quantity;

  const handleAdd = () => {
    if (!product || !selectedUnit) return;
    if (quantity < 1) return;
    if (quantity > remaining) {
      toast.error(
        remaining === 0
          ? `Stok ${selectedUnit.unitName} habis`
          : `Hanya tersisa ${remaining} ${selectedUnit.unitName}`,
      );
      return;
    }
    addToCart({
      productId: product.id,
      productUnitId: selectedUnit.id,
      productName: product.name,
      unitName: selectedUnit.unitName,
      price: selectedUnit.price,
      quantity,
    });
    toast.success(
      `${product.name} · ${selectedUnit.unitName} ×${quantity} masuk keranjang`,
    );
    setQuantity(1);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={880}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      {product && selectedUnit ? (
        <div className="grid grid-cols-1 md:grid-cols-[336px_1fr] gap-6">
          {/* Image panel */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square rounded-2xl border border-border bg-muted/50 overflow-hidden">
              <div
                key={selectedUnit.id}
                className="absolute inset-0 flex items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-300 ease-out"
              >
                {selectedUnit.imageUrl ? (
                  <Image
                    src={selectedUnit.imageUrl}
                    fill
                    alt={`${product.name} ${selectedUnit.unitName}`}
                    className="object-cover"
                    draggable={false}
                    sizes="336px"
                  />
                ) : (
                  <UnitArtwork unitName={selectedUnit.unitName} />
                )}
              </div>

              {product.category && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur border border-border text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
                  {product.category}
                </span>
              )}

              {selectedCartQty > 0 && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-success text-success-foreground text-xs font-semibold tnum shadow-card">
                  {selectedCartQty} di keranjang
                </span>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card/90 backdrop-blur border border-border text-xs font-medium">
                {selectedUnit.unitName} · Stok{" "}
                <span className="tnum">{selectedStock}</span>
              </div>
            </div>

            {units.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {units.map((u) => {
                  const active = u.id === selectedUnit.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        setQuantity(1);
                      }}
                      aria-label={`Pilih ${u.unitName}`}
                      className={cn(
                        "relative aspect-square rounded-xl border bg-muted/50 p-2 press-down transition-all",
                        active
                          ? "border-foreground ring-2 ring-foreground/15"
                          : "border-border hover:border-foreground/30",
                      )}
                    >
                      <UnitArtwork unitName={u.unitName} />
                      {(cartQtyByUnit[u.id] ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 inline-flex items-center justify-center rounded-full bg-success text-success-foreground text-[10px] font-bold tnum">
                          {cartQtyByUnit[u.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight leading-tight">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-5">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold">Pilih Satuan</h3>
                <span className="text-[11px] text-muted-foreground">
                  {units.length} pilihan
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {units.map((u) => {
                  const active = u.id === selectedUnit.id;
                  const stock = stockByUnit[u.id] ?? 0;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        setQuantity(1);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border p-2.5 text-left press-down transition-all",
                        active
                          ? "border-foreground bg-accent/60 shadow-card"
                          : "border-border bg-card hover:border-foreground/25",
                      )}
                    >
                      <span className="h-10 w-10 shrink-0 rounded-lg bg-muted/70 p-1.5">
                        <UnitArtwork unitName={u.unitName} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold truncate">
                          {u.unitName}
                        </span>
                        <span className="block text-xs text-muted-foreground tnum">
                          {formatRp(u.price)} · Stok {stock}
                        </span>
                      </span>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Harga · {selectedUnit.unitName}
              </p>
              <p className="text-2xl font-semibold tnum tracking-tight">
                {formatRp(selectedUnit.price)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                  Jumlah
                </p>
                <div className="inline-flex items-center rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-l-xl hover:bg-accent transition-colors"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="h-11 w-14 text-center text-base font-semibold tnum bg-transparent focus:outline-none"
                    aria-label="Jumlah"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-r-xl hover:bg-accent transition-colors"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Subtotal
                </p>
                <p className="text-2xl font-semibold tnum tracking-tight">
                  {formatRp(lineTotal)}
                </p>
              </div>
            </div>

            {remaining < 1 ? (
              <p className="mt-2 text-[11px] text-destructive font-medium">
                Stok tidak mencukupi
              </p>
            ) : quantity > remaining ? (
              <p className="mt-2 text-[11px] text-warning-foreground font-medium tnum">
                Maks {remaining} dapat ditambahkan
              </p>
            ) : null}

            <div className="mt-auto pt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="col-span-1 h-12 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down"
              >
                Selesai
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={remaining < 1 || quantity > remaining}
                className={cn(
                  "col-span-2 h-12 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
                  "bg-foreground text-background hover:bg-foreground/90",
                  "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                Tambah · {formatRp(lineTotal)}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Memuat produk…
        </p>
      )}
    </Modal>
  );
}

export type { Product };
