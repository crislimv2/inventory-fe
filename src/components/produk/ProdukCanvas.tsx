"use client";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Archive,
  ArchiveRestore,
  Boxes,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { usePos, categoriesOf } from "@/lib/store/usePos";
import { Product } from "@/lib/store/types";
import { archiveProduct, unarchiveProduct } from "@/lib/store/repos/products";
import { read } from "@/lib/store/storage";
import { ProductDrawer } from "./ProductDrawer";

export function ProdukCanvas() {
  const hydrated = usePos((s) => s.hydrated);
  const products = usePos((s) => s.products);
  const units = usePos((s) => s.units);
  const stockState = usePos((s) => s.stock);
  const lowStockThreshold = usePos((s) => s.settings.lowStockThreshold);
  const refreshCatalog = usePos((s) => s.refreshCatalog);
  const categories = usePos(useShallow(categoriesOf));

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allProducts = useMemo(() => {
    if (!showArchived) return products;
    return read<Product[]>("products", []);
  }, [products, showArchived]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts
      .filter((p) => {
        if (filterCat !== "all" && p.category !== filterCat) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      })
      .map((p) => {
        const productUnits = units.filter((u) => u.productId === p.id);
        const totalStock = productUnits.reduce((s, u) => {
          const snap = stockState.find((x) => x.productUnitId === u.id);
          return s + (snap?.onHand ?? 0);
        }, 0);
        const priceFrom = productUnits.length
          ? Math.min(...productUnits.map((u) => u.price))
          : 0;
        return { product: p, productUnits, totalStock, priceFrom };
      })
      .sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [allProducts, query, filterCat, units, stockState]);

  const handleAdd = () => {
    setDrawerProduct(null);
    setDrawerOpen(true);
  };
  const handleEdit = (p: Product) => {
    setDrawerProduct(p);
    setDrawerOpen(true);
  };
  const handleArchive = (p: Product) => {
    archiveProduct(p.id);
    refreshCatalog();
    toast.info(`${p.name} diarsipkan`);
  };
  const handleUnarchive = (p: Product) => {
    unarchiveProduct(p.id);
    refreshCatalog();
    toast.success(`${p.name} diaktifkan kembali`);
  };

  return (
    <>
      <TopBarGlobal
        title="Produk"
        subtitle="Kelola katalog & harga"
        right={
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 press-down"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        }
      />

      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama / kategori / barcode"
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter kategori"
        >
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className={cn(
            "h-10 px-3 rounded-xl border text-sm font-medium press-down transition-colors inline-flex items-center gap-1.5",
            showArchived
              ? "bg-foreground text-background border-foreground"
              : "border-border bg-card hover:bg-accent",
          )}
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? "Termasuk arsip" : "Hanya aktif"}
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {!hydrated ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Boxes className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Belum ada produk</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Klik “Tambah Produk” untuk memulai katalog Anda.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Produk</th>
                <th className="px-3 py-3 font-semibold">Kategori</th>
                <th className="px-3 py-3 font-semibold text-right">Satuan</th>
                <th className="px-3 py-3 font-semibold text-right">
                  Mulai dari
                </th>
                <th className="px-3 py-3 font-semibold text-right">Stok</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(
                ({ product, productUnits, totalStock, priceFrom }) => {
                  const archived = !!product.archivedAt;
                  const lowStock =
                    productUnits.length > 0 &&
                    totalStock > 0 &&
                    totalStock <= lowStockThreshold;
                  const outOfStock =
                    productUnits.length > 0 && totalStock <= 0;
                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        "hover:bg-accent/40 transition-colors",
                        archived && "opacity-60",
                      )}
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium">{product.name}</p>
                        {product.barcode && (
                          <p className="text-[11px] text-muted-foreground tnum">
                            {product.barcode}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {product.category}
                      </td>
                      <td className="px-3 py-3 text-right tnum">
                        {productUnits.length}
                      </td>
                      <td className="px-3 py-3 text-right tnum font-medium">
                        {priceFrom > 0 ? formatRp(priceFrom) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {productUnits.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "tnum text-sm font-medium",
                              outOfStock
                                ? "text-destructive"
                                : lowStock
                                  ? "text-warning-foreground"
                                  : "text-foreground",
                            )}
                          >
                            {totalStock}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent press-down"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Ubah
                          </button>
                          {archived ? (
                            <button
                              type="button"
                              onClick={() => handleUnarchive(product)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent press-down"
                              aria-label="Aktifkan kembali"
                              title="Aktifkan kembali"
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleArchive(product)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-soft press-down"
                              aria-label="Arsipkan"
                              title="Arsipkan"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        )}
      </ScrollArea>

      <ProductDrawer
        isOpen={drawerOpen}
        product={drawerProduct}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
