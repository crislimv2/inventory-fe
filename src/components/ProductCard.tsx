import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";

export function ProductCard({
  name,
  units,
  onClick,
  cartQuantity,
  priceFrom,
  category,
  unavailable,
  stock,
  lowStock,
  outOfStock,
}: ProductCardProps) {
  const isBlocked = unavailable || outOfStock;
  return (
    <button
      type="button"
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card text-left overflow-hidden press-down",
        "transition-all duration-200 ease-out",
        isBlocked
          ? "border-border/60 opacity-60 cursor-not-allowed"
          : "border-border hover:border-foreground/20 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
        cartQuantity > 0 && "border-foreground/40 ring-1 ring-foreground/10",
      )}
      aria-label={name}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        <Image
          src="/1rcgKA.jpg"
          width={400}
          height={400}
          alt={name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300 ease-out",
            !isBlocked && "group-hover:scale-[1.04]",
          )}
          draggable={false}
        />

        {cartQuantity > 0 && (
          <div className="absolute top-2 right-2 z-10 min-w-7 h-7 px-2 flex items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold shadow-card tnum">
            {cartQuantity}
          </div>
        )}

        {category && !isBlocked && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-card/90 backdrop-blur-sm border border-border text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {category}
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-end p-2">
            <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-card text-destructive border border-destructive/30">
              Stok habis
            </span>
          </div>
        )}

        {unavailable && !outOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-end p-2">
            <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-card text-muted-foreground border border-border">
              Tidak tersedia
            </span>
          </div>
        )}

        {lowStock && !outOfStock && !unavailable && (
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning-soft border border-warning/40 text-[10px] font-semibold text-warning-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span className="tnum">{stock}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-3 py-2.5 min-h-[68px]">
        <p className="text-sm font-medium leading-tight line-clamp-2 text-foreground">
          {name}
        </p>
        <div className="flex items-end justify-between gap-2 mt-auto">
          {priceFrom != null && priceFrom > 0 ? (
            <span className="text-sm font-semibold tnum text-foreground">
              {formatRp(priceFrom)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {units.length > 1 ? `${units.length} satuan` : units[0] || "—"}
            </span>
          )}
          {units.length > 1 && priceFrom != null && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {units.length} sat.
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
