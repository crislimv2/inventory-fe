"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHydrated } from "@/lib/useHydrated";
import { usePos } from "@/lib/store/usePos";
import { formatDate, formatTime } from "@/lib/format";
import { useSyncExternalStore } from "react";

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
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function TopBarGlobal({ title, subtitle, right }: Props) {
  const hydrated = useHydrated();
  const merchant = usePos((s) => s.settings.merchant);
  const nowMs = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    getServerClock,
  );
  const now = nowMs ? new Date(nowMs) : null;

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background px-6 flex items-center justify-between">
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight truncate">
          {title ?? (hydrated ? merchant.name : "Toko")}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {right}
        {now && (
          <div className="hidden md:block text-right">
            <p className="text-xs text-muted-foreground tnum">
              {formatTime(now)}
            </p>
            <p className="text-[11px] text-muted-foreground tnum">
              {formatDate(now)}
            </p>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
