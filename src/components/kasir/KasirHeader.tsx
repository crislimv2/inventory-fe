"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  Search,
  ScanLine,
  X,
  Layers,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/format";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHydrated } from "@/lib/useHydrated";
import { usePos } from "@/lib/store/usePos";

let cachedClock = 0;
const subscribeClock = (cb: () => void) => {
  cachedClock = Date.now();
  cb();
  const t = setInterval(() => {
    cachedClock = Date.now();
    cb();
  }, 30_000);
  return () => clearInterval(t);
};
const getClockSnapshot = () => cachedClock;
const getServerClock = () => 0;

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  onScanSubmit?: (code: string) => void;
  onOpenHolds: () => void;
  heldCount: number;
};

export function KasirHeader({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onScanSubmit,
  onOpenHolds,
  heldCount,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();
  const merchant = usePos((s) => s.settings.merchant);
  const nowMs = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    getServerClock,
  );
  const now = nowMs ? new Date(nowMs) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        onSearchChange("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchChange]);

  const tabs = ["Semua", ...categories];

  return (
    <header className="flex flex-col border-b border-border bg-background">
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim() && onScanSubmit) {
                onScanSubmit(search.trim());
              }
            }}
            placeholder="Cari produk atau scan barcode..."
            aria-label="Cari produk"
            className={cn(
              "w-full h-11 pl-10 pr-24 rounded-xl border border-border bg-card",
              "text-sm placeholder:text-muted-foreground",
              "transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30",
            )}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label="Bersihkan pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-6 px-1.5 items-center gap-0.5 rounded-md border border-border bg-muted text-[10px] text-muted-foreground font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 h-11 px-3.5 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          <ScanLine className="h-4 w-4" />
          <span>Siap menerima scan</span>
        </div>

        <button
          type="button"
          onClick={onOpenHolds}
          className={cn(
            "relative inline-flex items-center gap-2 h-11 px-3.5 rounded-xl border border-border bg-card press-down",
            "text-sm font-medium hover:bg-accent transition-colors",
            heldCount > 0 && "border-foreground/25",
          )}
          aria-label="Transaksi ditahan"
        >
          <Layers className="h-4 w-4" />
          <span className="hidden md:inline">Hold</span>
          <span className="tnum">{heldCount}</span>
        </button>

        <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          {now && (
            <span className="tnum">
              {hydrated ? merchant.name : "Toko"} · {formatDate(now)} ·{" "}
              {formatTime(now)}
            </span>
          )}
        </div>

        <ThemeToggle />
      </div>

      <div className="px-6 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {tabs.map((tab) => {
            const value = tab === "Semua" ? "all" : tab;
            const isActive = selectedCategory === value;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onCategoryChange(value)}
                className={cn(
                  "shrink-0 h-9 px-3.5 rounded-full text-sm font-medium press-down transition-colors",
                  isActive
                    ? "bg-foreground text-background border border-foreground"
                    : "bg-card text-foreground border border-border hover:bg-accent",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
