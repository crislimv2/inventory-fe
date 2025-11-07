import { ShoppingCart, Trash2, X } from "lucide-react";
import { CartSidebarProps } from "../../components/interfaces/CartSidebarProps";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { InputNumber, InputNumberProps } from "antd";
import { toast } from "sonner"
export function CartSidebar({isOpen, onToggle, items, onRemoveItem, onUpdateItem, setIsCheckoutModalOpen}: CartSidebarProps) {
    let index=0;

    const total = items.reduce((total, item) => {
      const itemTotal = item.units?.reduce(
        (sum, unit) => sum + ((unit.price || 0) * (unit.quantity || 0)),
        0
      ) || 0;
      return total + itemTotal;
    }, 0);

    const grandTotal = Math.round(total);


    const handleQuantityChange = (itemId: string, unitId: string, value: number) => {
      onUpdateItem(itemId, unitId, { quantity: value });
    };
    const handlePriceChange = (itemId: string, unitId: string, value: number) => {
      onUpdateItem(itemId, unitId, { price: value });
    };

    const handleTotalChange = (
      itemId: string, 
      unitId: string, 
      currentTotal: number, 
      unitQty: number
    ) => {
      const newTotal = Number(currentTotal) || 0;
      if (unitQty <= 0) return;

      // Multiply, round, divide to avoid floating-point loss
      const preciseDivision = newTotal / unitQty;
      const newPrice = Math.round((preciseDivision + Number.EPSILON) * 100) / 100;

      onUpdateItem(itemId, unitId, { price: newPrice });
    }

    const formatter: InputNumberProps<number>["formatter"] = (value) => {
      if (!value && value !== 0) return "";
      const parts = value.toString().split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      const decimalPart = parts[1] ? `.${parts[1]}` : "";
      return `Rp ${integerPart}${decimalPart}`;
    };
    
    // --- Parser: Convert from "Rp 20.000.000" -> 20000000 ---
    const parser: InputNumberProps<number>["parser"] = (value) => {
      if (!value) return 0;
      const numeric = value.replace(/[Rp\s.]/g, ""); // remove Rp, spaces, and dots
      return Number(numeric);
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
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <h2 className="font-semibold">Cart</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-gray-300/60 hover:cursor-pointer">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={onToggle} className=" m hover:bg-gray-300/60 hover:cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Items */}
          {isOpen && (
            <>
                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-3 mx-2">
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
                                        className="bg-muted/50 rounded-xl hover:bg-gray-200/90 space-y-2 px-2 py-1 transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-100"
                                    >
                                      <div className="flex items-start gap-3">
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7C3BED] text-primary-foreground text-xs font-medium shrink-0">
                                              {index}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm truncate">{item.name}</p>
                                              <p className="text-sm text-muted-foreground">({unit.unitName})</p>
                                          </div>
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 hover:p-4 hover:cursor-pointer"
                                              onClick={() => onRemoveItem(item.id, unit.id)}
                                          >
                                              <Trash2 className="h-3 w-3" />
                                          </Button>
                                      </div>
                                            
                                      <div className="grid grid-cols-2 gap-2 pl-9">
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
                                            <InputNumber<number>
                                              style={{ width: '70%' }}
                                              min={0}
                                              max={999}
                                              pattern="[0-9]*"
                                              value={unit.quantity}
                                              onChange={(e) => {
                                                handleQuantityChange(item.id, unit.id, Number(e))
                                              }}
                                              controls={false}
                                              size="middle"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Price</label>
                                            <InputNumber<number>
                                              style={{ width: '100%' }}
                                              min={0}
                                              value={unit.price}
                                              onChange={(e) => handlePriceChange(item.id, unit.id, Number(e))}
                                              controls={false}
                                              size="middle"
                                              formatter={formatter}
                                              parser={parser}
                                            />
                                        </div>
                                      </div>
                                      
                                      <div className="pl-9">
                                        <label className="text-xs text-muted-foreground mb-1 block">Total</label>
                                        <InputNumber<number>
                                          style={{ width: '100%', fontWeight: '600' }}
                                          value={Math.round(unit.price * unit.quantity)}
                                          controls={false}
                                          onKeyDown={(e) => {
                                            if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
                                          }}
                                          size="middle"
                                          formatter={formatter}
                                          parser={parser}
                                          // onChange={(e) => {
                                          //   handleTotalChange(item.id, unit.id, Number(e), unit.quantity || 0);
                                          // }}
                                          onBlur={(e) => {
                                            const rawValue = e.target.value ? parser(e.target.value) : 0;
                                            handleTotalChange(item.id, unit.id, rawValue, unit.quantity || 0);
                                          }}
                                          onPressEnter={(e) => {
                                            const rawValue = Number((e.target as HTMLInputElement).value.replace(/[Rp\s.]/g, "")) || 0;
                                            handleTotalChange(item.id, unit.id, rawValue, unit.quantity || 0);
                                          }}
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
                    <span className="text-2xl font-bold text-[#7C3BED]">
                        Rp. {grandTotal.toLocaleString()}
                    </span>
                    </div>
                    <Button 
                      className="w-full bg-[#7C3BED] hover:bg-[#8c52ef] hover:cursor-pointer" size="lg" disabled={items.length === 0}
                      onClick={() => {
                        setIsCheckoutModalOpen(true);
                      }}
                    >
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
