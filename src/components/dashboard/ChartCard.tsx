"use client";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
  height?: number;
};

export function ChartCard({
  title,
  subtitle,
  className,
  children,
  height = 280,
}: Props) {
  const hydrated = useHydrated();
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 flex flex-col",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div style={{ height }}>
        {hydrated ? (
          children
        ) : (
          <div className="h-full w-full rounded-xl bg-muted/60 animate-pulse" />
        )}
      </div>
    </div>
  );
}
