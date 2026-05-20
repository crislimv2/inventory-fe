"use client";
import { InputNumber, Modal } from "antd";
import { SelectedProductModalProps } from "./interfaces/SelectedProductModalProps";
import { Check, Minus, Pencil, Plus, ShoppingCart, X } from "lucide-react";
import { Product } from "./interfaces/Product";
import { ProductUnit } from "./interfaces/ProductUnit";
import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { UnitArtwork } from "@/components/UnitArtwork";

const buildDraft = (product: Product | null): Product | null =>
  product
    ? {
        ...product,
        units: product.units?.map((u) => ({ ...u })) ?? [],
      }
    : null;

const SelectedProductModal: React.FC<SelectedProductModalProps> = ({
  isOpen,
  product,
  cart,
  onClose,
  setCart,
}) => {
  const [draft, setDraft] = useState<Product | null>(() => buildDraft(product));
  const [prevProductId, setPrevProductId] = useState<string | null>(
    product?.id ?? null,
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    product?.units?.[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [editingPrice, setEditingPrice] = useState(false);

  // Reset all local state when a different product is opened.
  const currentId = product?.id ?? null;
  if (currentId !== prevProductId) {
    setPrevProductId(currentId);
    setDraft(buildDraft(product));
    setSelectedUnitId(product?.units?.[0]?.id ?? null);
    setQuantity(1);
    setEditingPrice(false);
  }

  const units = draft?.units ?? [];
  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) ?? units[0] ?? null,
    [units, selectedUnitId],
  );

  const cartQtyByUnit = useMemo(() => {
    const map: Record<string, number> = {};
    const inCart = cart.find((p) => p.id === draft?.id);
    for (const u of inCart?.units ?? []) map[u.id] = u.quantity || 0;
    return map;
  }, [cart, draft]);

  const productCartQty = useMemo(
    () => Object.values(cartQtyByUnit).reduce((a, b) => a + b, 0),
    [cartQtyByUnit],
  );

  const lineTotal = (selectedUnit?.price || 0) * quantity;

  const updateUnit = (unitId: string, patch: Partial<ProductUnit>) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            units: prev.units?.map((u) =>
              u.id === unitId ? { ...u, ...patch } : u,
            ),
          }
        : prev,
    );
  };

  const handleAddToCart = () => {
    if (!draft || !selectedUnit || quantity < 1) return;
    const unitToAdd: ProductUnit = { ...selectedUnit, quantity };

    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === draft.id);
      if (idx === -1) {
        return [...prev, { ...draft, units: [unitToAdd] }];
      }
      const updated = [...prev];
      const existing = updated[idx];
      const unitIdx = existing.units?.findIndex((u) => u.id === unitToAdd.id) ?? -1;
      if (unitIdx === -1) {
        updated[idx] = {
          ...existing,
          units: [...(existing.units ?? []), unitToAdd],
        };
      } else {
        const newUnits = [...(existing.units ?? [])];
        newUnits[unitIdx] = {
          ...newUnits[unitIdx],
          price: unitToAdd.price,
          quantity: (newUnits[unitIdx].quantity || 0) + quantity,
        };
        updated[idx] = { ...existing, units: newUnits };
      }
      return updated;
    });

    toast.success(
      `${draft.name} · ${selectedUnit.unitName} ×${quantity} masuk keranjang`,
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
      {draft && selectedUnit ? (
        <div className="grid grid-cols-1 md:grid-cols-[336px_1fr] gap-6">
          {/* ===== Image panel ===== */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square rounded-2xl border border-border bg-muted/50 overflow-hidden">
              {/* variant-aware visual — cross-fades on selection change */}
              <div
                key={selectedUnit.id}
                className="absolute inset-0 flex items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-300 ease-out"
              >
                {selectedUnit.imageUrl ? (
                  <Image
                    src={selectedUnit.imageUrl}
                    fill
                    alt={`${draft.name} ${selectedUnit.unitName}`}
                    className="object-cover"
                    draggable={false}
                    sizes="336px"
                  />
                ) : (
                  <UnitArtwork unitName={selectedUnit.unitName} />
                )}
              </div>

              {draft.category && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur border border-border text-[10px] uppercase tracking-wide font-medium text-muted-foreground">
                  {draft.category}
                </span>
              )}

              {(cartQtyByUnit[selectedUnit.id] || 0) > 0 && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-success text-success-foreground text-xs font-semibold tnum shadow-card">
                  {cartQtyByUnit[selectedUnit.id]} di keranjang
                </span>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card/90 backdrop-blur border border-border text-xs font-medium">
                {selectedUnit.unitName}
              </div>
            </div>

            {/* variant thumbnails */}
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
                        setEditingPrice(false);
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
                      {(cartQtyByUnit[u.id] || 0) > 0 && (
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

          {/* ===== Details ===== */}
          <div className="flex flex-col min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight leading-tight">
              {draft.name}
            </h2>
            {draft.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {draft.description}
              </p>
            )}
            {productCartQty > 0 && (
              <p className="text-xs text-success font-medium mt-2 tnum">
                {productCartQty} unit produk ini sudah di keranjang
              </p>
            )}

            {/* Variant selector */}
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
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        setEditingPrice(false);
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
                          {formatRp(u.price)}
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

            {/* Price (editable) */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Harga · {selectedUnit.unitName}
                </p>
                {editingPrice ? (
                  <InputNumber<number>
                    autoFocus
                    size="middle"
                    className="mt-1 w-44!"
                    value={selectedUnit.price}
                    min={0}
                    controls={false}
                    onChange={(v) => updateUnit(selectedUnit.id, { price: v ?? 0 })}
                    onPressEnter={() => setEditingPrice(false)}
                    formatter={(v) =>
                      v
                        ? `Rp ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                        : ""
                    }
                    parser={(v) => Number(v?.replace(/[^\d]/g, "") || "0")}
                  />
                ) : (
                  <p className="text-2xl font-semibold tnum tracking-tight">
                    {formatRp(selectedUnit.price)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditingPrice((v) => !v)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors press-down",
                  editingPrice
                    ? "bg-foreground text-background border-foreground"
                    : "border-border bg-card hover:bg-accent text-muted-foreground",
                )}
                aria-label={editingPrice ? "Selesai ubah harga" : "Ubah harga"}
              >
                {editingPrice ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Quantity + subtotal */}
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

            {/* Actions */}
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
                onClick={handleAddToCart}
                className={cn(
                  "col-span-2 h-12 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
                  "bg-foreground text-background hover:bg-foreground/90",
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
};

export default SelectedProductModal;
