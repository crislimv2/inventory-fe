"use client";
import { useMemo, useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import { CartSidebar } from "@/components/CartSidebar";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductUnit } from "./interfaces/ProductUnit";
import { toast } from "sonner";
import { PackageSearch } from "lucide-react";
import SelectedProductModal from "./SelectedProductModal";
import CheckoutProductModal from "./CheckoutProductModal";
import HeldTransactionsModal from "./HeldTransactionsModal";
import { HeldTransaction } from "./interfaces/HeldTransaction";
import {
  cloneCart,
  computeCartTotals,
  getCategoriesFromProducts,
  getProductCartQuantity,
} from "@/lib/cart";
import { useBarcodeScanner } from "@/lib/useBarcodeScanner";

const Card = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [holds, setHolds] = useState<HeldTransaction[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isHoldsOpen, setIsHoldsOpen] = useState(false);

  const categories = useMemo(() => getCategoriesFromProducts(dummyData), []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dummyData
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory)
          return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aInCart = cart.some((i) => i.id === a.id);
        const bInCart = cart.some((i) => i.id === b.id);
        const aHasUnits = !!a.units?.length;
        const bHasUnits = !!b.units?.length;
        if (aInCart && !bInCart) return -1;
        if (!aInCart && bInCart) return 1;
        if (aHasUnits && !bHasUnits) return -1;
        if (!aHasUnits && bHasUnits) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [cart, searchQuery, selectedCategory]);

  const openProduct = (product: Product) => {
    if (!product.units?.length) {
      toast.error("Produk belum memiliki satuan harga");
      return;
    }
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleScanLookup = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;
    const found = dummyData.find(
      (p) =>
        p.id.toLowerCase() === trimmed ||
        p.name.toLowerCase() === trimmed,
    );
    if (!found) {
      toast.error(`Produk "${code}" tidak ditemukan`);
      return;
    }
    if (!found.units?.length) {
      toast.error(`${found.name} belum memiliki satuan harga`);
      return;
    }
    if (found.units.length === 1) {
      quickAddToCart(found, found.units[0].id);
      toast.success(`${found.name} ditambahkan`);
      setSearchQuery("");
      return;
    }
    setSearchQuery("");
    openProduct(found);
  };

  useBarcodeScanner({
    onScan: handleScanLookup,
    minLength: 6,
    enabled: !isProductModalOpen && !isCheckoutModalOpen && !isHoldsOpen,
  });

  const quickAddToCart = (product: Product, unitId: string) => {
    const unit = product.units?.find((u) => u.id === unitId);
    if (!unit) return;
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) {
        return [
          ...prev,
          {
            ...product,
            units: [{ ...unit, quantity: 1 }],
          },
        ];
      }
      const updated = [...prev];
      const existing = updated[idx];
      const existingUnitIdx =
        existing.units?.findIndex((u) => u.id === unitId) ?? -1;
      if (existingUnitIdx === -1) {
        updated[idx] = {
          ...existing,
          units: [...(existing.units ?? []), { ...unit, quantity: 1 }],
        };
      } else {
        const newUnits = [...(existing.units ?? [])];
        newUnits[existingUnitIdx] = {
          ...newUnits[existingUnitIdx],
          quantity: (newUnits[existingUnitIdx].quantity || 0) + 1,
        };
        updated[idx] = { ...existing, units: newUnits };
      }
      return updated;
    });
  };

  const removeFromCart = (productId: string, unitId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                units: item.units?.filter((unit) => unit.id !== unitId),
              }
            : item,
        )
        .filter((item) => item.units && item.units.length > 0),
    );
  };

  const updateCartItem = (
    productId: string,
    unitId: string,
    updates: Partial<ProductUnit>,
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              units: item.units?.map((unit) =>
                unit.id === unitId ? { ...unit, ...updates } : unit,
              ),
            }
          : item,
      ),
    );
  };

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const totals = computeCartTotals(cart);
    const stamp = new Date();
    const seq = holds.length + 1;
    const newHold: HeldTransaction = {
      id: `hold-${Date.now()}`,
      label: `Hold #${seq} · ${cart[0]?.name ?? "Transaksi"}${
        cart.length > 1 ? ` +${cart.length - 1}` : ""
      }`,
      cart: cloneCart(cart),
      createdAt: stamp,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
    };
    setHolds((h) => [newHold, ...h]);
    setCart([]);
  };

  const handleResumeHold = (id: string) => {
    const target = holds.find((h) => h.id === id);
    if (!target) return;

    if (cart.length > 0) {
      const totals = computeCartTotals(cart);
      setHolds((prev) => [
        {
          id: `hold-${Date.now()}`,
          label: `Hold otomatis · ${cart[0]?.name ?? "Transaksi"}`,
          cart: cloneCart(cart),
          createdAt: new Date(),
          itemCount: totals.itemCount,
          subtotal: totals.subtotal,
        },
        ...prev.filter((h) => h.id !== id),
      ]);
    } else {
      setHolds((prev) => prev.filter((h) => h.id !== id));
    }
    setCart(target.cart);
    setIsHoldsOpen(false);
    toast.success("Transaksi dilanjutkan");
  };

  const handleDeleteHold = (id: string) => {
    setHolds((prev) => prev.filter((h) => h.id !== id));
    toast.info("Transaksi ditahan dihapus");
  };

  const handleRenameHold = (id: string, label: string) => {
    setHolds((prev) =>
      prev.map((h) => (h.id === id ? { ...h, label } : h)),
    );
    toast.success("Nama transaksi diperbarui");
  };

  const handleClearCart = () => setCart([]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <CartSidebar
        items={cart}
        onRemoveItem={removeFromCart}
        onUpdateItem={updateCartItem}
        onClearCart={handleClearCart}
        onHoldCart={handleHoldCart}
        onOpenHolds={() => setIsHoldsOpen(true)}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        heldCount={holds.length}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onScanSubmit={handleScanLookup}
        />

        <ScrollArea className="flex-1 min-h-0">
          {filteredProducts.length === 0 ? (
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
                const lowestPrice = product.units?.length
                  ? Math.min(...product.units.map((u) => u.price || 0))
                  : 0;
                return (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    image={product.imageUrl || "/placeholder.svg"}
                    cartQuantity={getProductCartQuantity(cart, product.id)}
                    units={product.units?.map((u) => u.unitName) || []}
                    priceFrom={lowestPrice}
                    category={product.category}
                    unavailable={!product.units || product.units.length === 0}
                    onClick={() => openProduct(product)}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </main>

      <SelectedProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        cart={cart}
        setCart={setCart}
      />

      <CheckoutProductModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        setCart={setCart}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
      />

      <HeldTransactionsModal
        isOpen={isHoldsOpen}
        onClose={() => setIsHoldsOpen(false)}
        holds={holds}
        onResume={handleResumeHold}
        onDelete={handleDeleteHold}
        onRename={handleRenameHold}
        hasActiveCart={cart.length > 0}
      />
    </div>
  );
};

export default Card;
