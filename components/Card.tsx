'use client';
import { useState } from "react";
import { dummyData, Product } from "./interfaces/Product";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import SelectedProductModal from "./SelectedProductModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductUnit } from "./interfaces/ProductUnit";
import { toast } from "sonner"
import CheckoutProductModal from "./CheckoutProductModal";
import { SearchBar } from "@/components/SearchBar";

const Card = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState<true | false>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<true | false>(false);

  const getProductCartQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.units?.length || 0;
  };


  const filteredProducts = dummyData
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aInCart = cart.some((item) => item.id === a.id);
      const bInCart = cart.some((item) => item.id === b.id);
      const aHasUnits = a.units && a.units.length > 0;
      const bHasUnits = b.units && b.units.length > 0;

      // 1️⃣ Items already in cart come first
      if (aInCart && !bInCart) return -1;
      if (!aInCart && bInCart) return 1;

      // 2️⃣ Among the rest, products with units come first
      if (aHasUnits && !bHasUnits) return -1;
      if (!aHasUnits && bHasUnits) return 1;

      // 3️⃣ Otherwise, sort alphabetically for consistency
      return a.name.localeCompare(b.name);
  });



  const removeFromCart = (productId:string, unitId: string) => {
    // setCart((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? {
          ...item,
          units: item.units?.filter((unit) => unit.id !== unitId)
        } : item
      ).filter(item => item.units && item.units.length > 0) // Remove product if no units left
    );
    toast.info("Item removed from cart");
  };

  const updateCartItem = (productId:string, unitId: string, updates: Partial<ProductUnit>) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? {
          ...item,
          units: item.units?.map((unit) =>
            unit.id === unitId ? { ...unit, ...updates } : unit
          )
        } : item
      )
    );
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background">
      <CartSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        items={cart}
        onRemoveItem={removeFromCart}
        onUpdateItem={updateCartItem}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
      />
      <main className="flex-1 flex flex-col h-screen">
        <div className="p-0 m-0 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex flex-row gap-4 ml-5 my-4 ">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SearchBar value={searchQuery} onChange={setSearchQuery} /> 
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 min-h-0 bg-amber-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2 w-full p-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  image={product.imageUrl || "/placeholder.svg"}
                  cartQuantity={getProductCartQuantity(product.id)}
                  units={product.units?.map((u) => u.unitName) || []}
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsProductModalOpen(true);
                  }}
                />
              ))}
            </div>
          </ScrollArea>

          <SelectedProductModal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            product={selectedProduct}
            setCart={setCart}
          />

          <CheckoutProductModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            cart={cart}
            setCart={setCart}
            setIsCheckoutModalOpen={setIsCheckoutModalOpen}
          />

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </main>
    </div>

  );
};

export default Card;
