"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { usePos } from "@/lib/store/usePos";

const NAV = [
  { href: "/kasir", label: "Kasir", icon: ShoppingCart },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/stok", label: "Stok", icon: Boxes },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/riwayat", label: "Riwayat", icon: ReceiptText },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function LeftRail() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const merchantName = usePos((s) => s.settings.merchant.name);
  const [collapsed, setCollapsed] = useState(false);
  const [autoNarrow, setAutoNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => setAutoNarrow(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const narrow = collapsed || autoNarrow;

  return (
    <aside
      className={cn(
        "relative shrink-0 h-screen border-r border-border bg-sidebar text-sidebar-foreground flex flex-col",
        "transition-[width] duration-200 ease-out",
        narrow ? "w-16" : "w-60",
      )}
      aria-label="Navigasi utama"
    >
      <div
        className={cn(
          "h-16 flex items-center border-b border-border",
          narrow ? "justify-center px-2" : "px-4 gap-3",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <Store className="h-4.5 w-4.5" />
        </div>
        {!narrow && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold tracking-tight truncate">
              {hydrated ? merchantName : "Toko"}
            </p>
            <p className="text-[11px] text-muted-foreground">Point of Sale</p>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group inline-flex items-center gap-3 rounded-lg h-10 px-2.5 press-down transition-colors",
                narrow && "justify-center px-0",
                active
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              title={narrow ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!narrow && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg",
            narrow && "justify-center px-0",
          )}
        >
          <div className="h-7 w-7 shrink-0 rounded-full bg-accent text-foreground inline-flex items-center justify-center text-xs font-semibold">
            P
          </div>
          {!narrow && (
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Pemilik</p>
              <p className="text-[10px] text-muted-foreground">Akses penuh</p>
            </div>
          )}
        </div>
        {!autoNarrow && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            className={cn(
              "mt-1 w-full h-9 inline-flex items-center justify-center rounded-lg",
              "text-muted-foreground hover:bg-accent hover:text-foreground transition-colors press-down",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
