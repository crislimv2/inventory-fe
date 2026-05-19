"use client";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  PauseCircle,
  Layers,
  Receipt,
  Eraser,
} from "lucide-react";
import { CartSidebarProps } from "../../components/interfaces/CartSidebarProps";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { computeCartTotals } from "@/lib/cart";
import { toast } from "sonner";

export function CartSidebar({
  items,
  onRemoveItem,
  onUpdateItem,
  onClearCart,
  onHoldCart,
  onOpenHolds,
  setIsCheckoutModalOpen,
  heldCount,
}: CartSidebarProps) {
  const { subtotal, itemCount, lineCount } = computeCartTotals(items);
  const isEmpty = items.length === 0;

  const handleStep = (
    productId: string,
    unitId: string,
    currentQty: number,
    delta: number,
  ) => {
    const next = Math.max(0, currentQty + delta);
    if (next === 0) {
      onRemoveItem(productId, unitId);
      return;
    }
    onUpdateItem(productId, unitId, { quantity: next });
  };

  const handleHold = () => {
    if (isEmpty) {
      toast.error("Keranjang masih kosong");
      return;
    }
    onHoldCart();
    toast.success("Transaksi ditahan");
  };

  return (
    <aside className="flex flex-col h-full w-[380px] shrink-0 border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
            <ShoppingBag className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Keranjang</h2>
            <p className="text-xs text-muted-foreground tnum">
              {lineCount} item · {itemCount} qty
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenHolds}
            className={cn(
              "relative h-9 px-3 rounded-lg text-xs font-medium border border-border bg-card press-down",
              "hover:bg-accent transition-colors",
              heldCount > 0 && "border-foreground/20",
            )}
            aria-label="Lihat transaksi ditahan"
          >
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span className="tnum">{heldCount}</span>
            </div>
          </button>
          {!isEmpty && (
            <button
              type="button"
              onClick={() => {
                onClearCart();
                toast.info("Keranjang dikosongkan");
              }}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
              aria-label="Kosongkan keranjang"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Keranjang kosong</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Pilih produk dari katalog di kanan atau scan barcode untuk mulai transaksi.
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <ul className="px-3 py-3 space-y-1.5">
            {items.flatMap((item, productIdx) =>
              (item.units ?? []).map((unit, unitIdx) => {
                const lineTotal = (unit.price || 0) * (unit.quantity || 0);
                const number = productIdx + unitIdx + 1;
                return (
                  <li
                    key={`${item.id}-${unit.id}`}
                    className="group rounded-xl border border-transparent hover:border-border hover:bg-accent/40 px-2.5 py-2 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-foreground/5 text-[10px] font-semibold text-foreground tnum px-1">
                        {number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {unit.unitName} · {formatRp(unit.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id, unit.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive-soft"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between pl-7">
                      <div className="inline-flex items-center rounded-lg border border-border bg-card">
                        <button
                          type="button"
                          onClick={() =>
                            handleStep(item.id, unit.id, unit.quantity || 0, -1)
                          }
                          className="h-7 w-7 inline-flex items-center justify-center rounded-l-lg hover:bg-accent transition-colors"
                          aria-label="Kurangi"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold tnum">
                          {unit.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleStep(item.id, unit.id, unit.quantity || 0, 1)
                          }
                          className="h-7 w-7 inline-flex items-center justify-center rounded-r-lg hover:bg-accent transition-colors"
                          aria-label="Tambah"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tnum text-foreground">
                        {formatRp(lineTotal)}
                      </span>
                    </div>
                  </li>
                );
              }),
            )}
          </ul>
        </ScrollArea>
      )}

      {/* Footer */}
      <div className="border-t border-border bg-card/40 backdrop-blur px-5 py-4 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tnum">{formatRp(subtotal)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold">Total</span>
            <span className="text-2xl font-semibold tnum tracking-tight">
              {formatRp(subtotal)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className="col-span-1 h-11 rounded-xl press-down"
            disabled={isEmpty}
            onClick={handleHold}
          >
            <PauseCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Hold</span>
          </Button>
          <Button
            type="button"
            className={cn(
              "col-span-2 h-11 rounded-xl press-down font-semibold",
              "bg-foreground text-background hover:bg-foreground/90",
              "disabled:opacity-40",
            )}
            disabled={isEmpty || subtotal <= 0}
            onClick={() => setIsCheckoutModalOpen(true)}
          >
            <Receipt className="h-4 w-4" />
            <span>Bayar · {formatRp(subtotal)}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
