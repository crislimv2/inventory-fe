"use client";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";

type Props = {
  label: string;
  value: number;
  previous?: number;
  sparkline?: number[];
};

export function MetricCard({ label, value, previous, sparkline }: Props) {
  const hydrated = useHydrated();
  const delta =
    previous && previous > 0
      ? ((value - previous) / previous) * 100
      : value > 0
        ? 100
        : 0;
  const deltaSign: "up" | "down" | "flat" =
    delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
  const data =
    sparkline && sparkline.length > 0
      ? sparkline.map((v, i) => ({ x: i, y: v }))
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-semibold tnum tracking-tight">
            {formatRp(value)}
          </p>
          {previous != null && (
            <p
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 text-xs font-medium tnum",
                deltaSign === "up"
                  ? "text-success"
                  : deltaSign === "down"
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {deltaSign === "up" ? (
                <ArrowUp className="h-3 w-3" />
              ) : deltaSign === "down" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(delta).toFixed(1)}%{" "}
              <span className="text-muted-foreground">vs sebelumnya</span>
            </p>
          )}
        </div>
        {hydrated && data && (
          <div className="h-12 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="var(--color-foreground)"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
