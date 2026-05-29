"use client";
import { formatRp } from "@/lib/format";

interface Payload {
  name?: string;
  dataKey?: string;
  value?: number | string;
  color?: string;
}

type Props = {
  active?: boolean;
  label?: string | number;
  payload?: Payload[];
};

export function ChartTooltip({ active, label, payload }: Props) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card shadow-elevated px-3 py-2 text-xs">
      {label != null && (
        <p className="font-semibold mb-1 tracking-tight">{String(label)}</p>
      )}
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 tnum">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color ?? "var(--color-foreground)" }}
            />
            <span className="text-muted-foreground">
              {p.name ?? p.dataKey}
            </span>
            <span className="ml-auto font-semibold">
              {typeof p.value === "number"
                ? p.dataKey === "count"
                  ? p.value
                  : formatRp(Number(p.value))
                : p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
