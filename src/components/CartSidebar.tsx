import { ShoppingCart, Trash2, X } from "lucide-react";
import { CartSidebarProps } from "../../components/interfaces/CartSidebarProps";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";

export function CartSidebar({isOpen, onToggle, items, onRemoveItem, onUpdateItem}: CartSidebarProps) {
    let index=0;
    const total = items.map(item => 
        item.units?.reduce((unitSum, unit) => unitSum + ((unit.price || 0) * (unit.quantity || 0)), 0) || 0
    );

    const handleQuantityChange = (itemId: string, unitId: string, value: number) => {
      onUpdateItem(itemId, unitId, { quantity: value });
    };
    const handlePriceChange = (itemId: string, unitId: string, value: number) => {
      onUpdateItem(itemId, unitId, { price: value });
    };

    return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
            fixed lg:relative top-0 left-0 h-full bg-card border-r z-50
            transition-all duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 lg:w-16'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            {isOpen ? (
              <>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Cart</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onToggle}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={onToggle} className="mx-auto">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Items */}
          {isOpen && (
            <>
                <ScrollArea className="flex-1 p-4 min-h-0">
                    <div className="space-y-3">
                    {items.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                        Cart is empty
                        </p>
                    ) : (
                        items.map((item) => {
                            return item.units?.map((unit) => {
                                index++;
                                return (
                                    <div 
                                        key={unit.id}
                                        className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors space-y-2"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7C3BED] text-primary-foreground text-xs font-medium shrink-0">
                                                {index}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">({unit.unitName})</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 pl-9">
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
                                                <Input
                                                  type="number"
                                                  max="9999"
                                                  pattern="[0-9]*"
                                                  value={unit.quantity}
                                                  onChange={(e) => {
                                                    console.log(e.target.value);
                                                    handleQuantityChange(item.id, unit.id, Number(e.target.value))
                                                  }}
                                                  className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-1 block">Price</label>
                                                <Input
                                                type="number"
                                                min="0"
                                                value={unit.price}
                                                  onChange={(e) => handlePriceChange(item.id, unit.id, Number(e.target.value))}
                                                className="h-8 text-sm"
                                                />
                                            </div>
                                            </div>
                                            
                                            <div className="pl-9">
                                            <label className="text-xs text-muted-foreground mb-1 block">Total</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={unit.price * unit.quantity}
                                                onChange={(e) => {
                                                const newTotal = parseInt(e.target.value) || 0;
                                                const newPrice = unit.quantity > 0 ? Math.round(newTotal / unit.quantity) : 0;
                                                }}
                                                className="h-8 text-sm font-semibold"
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        })
                    )}
                    </div>
                </ScrollArea>

                {/* Total */}
                <div className="p-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                        Rp. {total.toLocaleString()}
                    </span>
                    </div>
                    <Button className="w-full" size="lg" disabled={items.length === 0}>
                    Checkout
                    </Button>
                </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
