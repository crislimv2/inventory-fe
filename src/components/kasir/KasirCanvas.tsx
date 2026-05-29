"use client";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCard } from "@/components/ProductCard";
import { KasirHeader } from "./KasirHeader";
import { CartPane } from "./CartPane";
import { UnitPickerModal } from "./UnitPickerModal";
import { CheckoutModal } from "./CheckoutModal";
import { HoldsModal } from "./HoldsModal";
import { useBarcodeScanner } from "@/lib/useBarcodeScanner";
import {
  usePos,
  categoriesOf,
  heldCount,
  unitsOf,
  stockOf,
} from "@/lib/store/usePos";
import { Product } from "@/lib/store/types";

export function KasirCanvas() {
  const hydrated = usePos((s) => s.hydrated);
  const products = usePos((s) => s.products);
  const units = usePos((s) => s.units);
  const stockState = usePos((s) => s.stock);
  const cart = usePos((s) => s.cart);
  const holdsCount = usePos(heldCount);
  const categories = usePos(useShallow(categoriesOf));
  const lowStockThreshold = usePos((s) => s.settings.lowStockThreshold);
  const addToCart = usePos((s) => s.addToCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pickerProductId, setPickerProductId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [holdsOpen, setHoldsOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cartProductIds = new Set(cart.map((c) => c.productId));
    return products
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory)
          return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase() === q
        );
      })
      .sort((a, b) => {
        const aInCart = cartProductIds.has(a.id);
        const bInCart = cartProductIds.has(b.id);
        if (aInCart && !bInCart) return -1;
        if (!aInCart && bInCart) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery, selectedCategory, cart]);

  const productDisplay = (product: Product) => {
    const productUnits = unitsOf({ units }, product.id);
    const unitNames = productUnits.map((u) => u.unitName);
    const priceFrom = productUnits.length
      ? Math.min(...productUnits.map((u) => u.price))
      : 0;
    const totalStock = productUnits.reduce(
      (s, u) => s + stockOf({ stock: stockState }, u.id),
      0,
    );
    const cartQuantity = cart
      .filter((c) => c.productId === product.id)
      .reduce((s, c) => s + c.quantity, 0);
    return {
      productUnits,
      unitNames,
      priceFrom,
      totalStock,
      cartQuantity,
      outOfStock: productUnits.length > 0 && totalStock <= 0,
      unavailable: productUnits.length === 0,
      lowStock: totalStock > 0 && totalStock <= lowStockThreshold,
    };
  };

  const openProduct = (product: Product) => {
    const d = productDisplay(product);
    if (d.unavailable) {
      toast.error("Produk belum memiliki satuan harga");
      return;
    }
    if (d.outOfStock) {
      toast.error("Stok produk habis");
      return;
    }
    setPickerProductId(product.id);
  };

  const handleScanLookup = (code: string) => {
    const q = code.trim().toLowerCase();
    if (!q) return;
    const found = products.find(
      (p) =>
        p.barcode?.toLowerCase() === q ||
        p.id.toLowerCase() === q ||
        p.name.toLowerCase() === q,
    );
    if (!found) {
      toast.error(`Produk "${code}" tidak ditemukan`);
      return;
    }
    const d = productDisplay(found);
    if (d.unavailable) {
      toast.error(`${found.name} belum memiliki satuan harga`);
      return;
    }
    if (d.outOfStock) {
      toast.error(`${found.name} stok habis`);
      return;
    }
    if (d.productUnits.length === 1) {
      const unit = d.productUnits[0];
      const stock = stockOf({ stock: stockState }, unit.id);
      const cartQty =
        cart.find((c) => c.productUnitId === unit.id)?.quantity ?? 0;
      if (stock - cartQty < 1) {
        toast.error(`Stok ${unit.unitName} habis`);
        return;
      }
      addToCart({
        productId: found.id,
        productUnitId: unit.id,
        productName: found.name,
        unitName: unit.unitName,
        price: unit.price,
        quantity: 1,
      });
      toast.success(`${found.name} ditambahkan`);
      setSearchQuery("");
      return;
    }
    setSearchQuery("");
    setPickerProductId(found.id);
  };

  useBarcodeScanner({
    onScan: handleScanLookup,
    minLength: 6,
    enabled:
      pickerProductId == null && !checkoutOpen && !holdsOpen,
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <KasirHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onScanSubmit={handleScanLookup}
          onOpenHolds={() => setHoldsOpen(true)}
          heldCount={holdsCount}
        />

        <ScrollArea className="flex-1 min-h-0">
          {!hydrated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-muted/60 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <PackageSearch className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coba kata kunci lain atau ubah kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-5">
              {filteredProducts.map((product) => {
                const d = productDisplay(product);
                return (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    image="/1rcgKA.jpg"
                    units={d.unitNames}
                    cartQuantity={d.cartQuantity}
                    priceFrom={d.priceFrom}
                    category={product.category}
                    unavailable={d.unavailable}
                    outOfStock={d.outOfStock}
                    lowStock={d.lowStock}
                    stock={d.totalStock}
                    onClick={() => openProduct(product)}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <CartPane onCheckout={() => setCheckoutOpen(true)} />

      <UnitPickerModal
        isOpen={pickerProductId !== null}
        productId={pickerProductId}
        onClose={() => setPickerProductId(null)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      <HoldsModal isOpen={holdsOpen} onClose={() => setHoldsOpen(false)} />
    </div>
  );
}
