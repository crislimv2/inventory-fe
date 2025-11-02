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

const Card = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // useEffect(() => {
  //   console.log("Cart initialized:", cart);
  // }, [cart]);

  const filteredProducts = dummyData.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    // <>
    //   <div className="block md:hidden bg-gray-400 w-full fixed top-0 z-50">
    //     <nav className="flex items-center justify-center h-8">
    //       <h1 className="text-sm font-semibold text-white">Hello</h1>
    //     </nav>
    //   </div>

    //   <div className="bg-[#E9ECEF] min-h-screen w-full flex md:overflow-hidden pt-8 md:pt-0">
    //     {/* Right Panel (Fixed) */}
    //     <div className="hidden md:block md:w-5/12 lg:w-4/12 xl:w-3/12 h-screen sticky top-0">
    //       <CardRightPanel cart={cart} setCart={setCart} />
    //     </div>

    //     {/* Left Panel (Scrollable) */}
    //     <div className="sm:w-full md:w-7/12 lg:w-8/12 xl:w-9/12 h-screen overflow-y-auto">
    //       <CardLeftPanel setCart={setCart} />
    //     </div>
        
    //   </div>
    // </>
    <div className="flex w-screen h-screen overflow-hidden bg-background">
      <CartSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        items={cart}
        onRemoveItem={removeFromCart}
        onUpdateItem={updateCartItem}
      />
      <main className="flex-1 flex flex-col h-screen">
        <div className="p-4 lg:p-4 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* <SearchBar value={searchQuery} onChange={setSearchQuery} /> */}
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  image={product.imageUrl || "/placeholder.svg"}
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


          {/* Product Details Modal */}
          {/* <ProductDetailsModal
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
            onAddToCart={handleAddToCart}
          />

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )} */}
        </div>
      </main>
    </div>

  );
};

export default Card;
