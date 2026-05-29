"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronUp,
  Hash,
  Layers3,
  Plus,
  Wallet,
} from "lucide-react";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRpShort, formatDate, formatTime } from "@/lib/format";
import { usePos, stockOf } from "@/lib/store/usePos";
import { listLedger } from "@/lib/store/repos/ledger";
import { LedgerReason } from "@/lib/store/types";
import { AdjustmentModal } from "./AdjustmentModal";

const TABS: { value: LedgerReason | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "sale", label: "Penjualan" },
  { value: "purchase", label: "Pembelian" },
  { value: "adjustment", label: "Penyesuaian" },
  { value: "audit", label: "Audit" },
  { value: "refund", label: "Refund" },
  { value: "opening", label: "Opening" },
];

export function StokCanvas() {
  const hydrated = usePos((s) => s.hydrated);
  const products = usePos((s) => s.products);
  const units = usePos((s) => s.units);
  const stockState = usePos((s) => s.stock);
  const lowStockThreshold = usePos((s) => s.settings.lowStockThreshold);

  const [tab, setTab] = useState<LedgerReason | "all">("all");
  const [adjustOpen, setAdjustOpen] = useState(false);

  const kpi = useMemo(() => {
    let totalUnits = 0;
    let lowStockUnits = 0;
    let outOfStockUnits = 0;
    let valueAtCost = 0;
    let valueAtSell = 0;
    for (const u of units) {
      totalUnits += 1;
      const onHand = stockOf({ stock: stockState }, u.id);
      if (onHand <= 0) outOfStockUnits += 1;
      else if (onHand <= lowStockThreshold) lowStockUnits += 1;
      valueAtCost += (u.costPrice ?? 0) * Math.max(0, onHand);
      valueAtSell += u.price * Math.max(0, onHand);
    }
    return {
      totalUnits,
      lowStockUnits,
      outOfStockUnits,
      valueAtCost,
      valueAtSell,
    };
  }, [units, stockState, lowStockThreshold]);

  const ledgerRows = useMemo(() => {
    const all = listLedger();
    const filtered = tab === "all" ? all : all.filter((e) => e.reason === tab);
    const productById = new Map(products.map((p) => [p.id, p]));
    const unitById = new Map(units.map((u) => [u.id, u]));
    return filtered
      .map((e) => {
        const unit = unitById.get(e.productUnitId);
        const product = unit ? productById.get(unit.productId) : null;
        return {
          entry: e,
          productName: product?.name ?? "—",
          unitName: unit?.unitName ?? "—",
        };
      })
      .sort((a, b) =>
        a.entry.occurredAt > b.entry.occurredAt ? -1 : 1,
      )
      .slice(0, 300);
  }, [tab, products, units]);

  return (
    <>
      <TopBarGlobal
        title="Stok"
        subtitle="Inventaris & ledger"
        right={
          <button
            type="button"
            onClick={() => setAdjustOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 press-down"
          >
            <Plus className="h-4 w-4" />
            Penyesuaian
          </button>
        }
      />

      {/* KPI rail */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4 border-b border-border">
        <KpiCard
          label="SKU Aktif"
          value={String(kpi.totalUnits)}
          icon={<Layers3 className="h-4 w-4" />}
        />
        <KpiCard
          label="Stok Menipis"
          value={String(kpi.lowStockUnits)}
          hint={`${kpi.outOfStockUnits} habis`}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={kpi.lowStockUnits > 0 ? "warning" : undefined}
        />
        <KpiCard
          label="Nilai Modal"
          value={formatRpShort(kpi.valueAtCost)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Nilai Jual"
          value={formatRpShort(kpi.valueAtSell)}
          icon={<Hash className="h-4 w-4" />}
        />
      </div>

      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  "shrink-0 h-9 px-3.5 rounded-full text-sm font-medium press-down transition-colors",
                  isActive
                    ? "bg-foreground text-background border border-foreground"
                    : "bg-card text-foreground border border-border hover:bg-accent",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {!hydrated ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : ledgerRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Boxes className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Belum ada catatan ledger</p>
            <p className="text-xs text-muted-foreground mt-1">
              Setiap penjualan, pembelian, dan penyesuaian akan tampil di sini.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Waktu</th>
                <th className="px-3 py-3 font-semibold">Produk · Satuan</th>
                <th className="px-3 py-3 font-semibold">Alasan</th>
                <th className="px-3 py-3 font-semibold text-right">Delta</th>
                <th className="px-6 py-3 font-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledgerRows.map(({ entry, productName, unitName }) => {
                const positive = entry.delta > 0;
                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="text-xs tnum">
                        {formatDate(new Date(entry.occurredAt))}
                      </p>
                      <p className="text-[11px] text-muted-foreground tnum">
                        {formatTime(new Date(entry.occurredAt))}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{productName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {unitName}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground capitalize">
                      {labelFor(entry.reason)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3 text-right tnum font-semibold",
                        positive ? "text-success" : "text-destructive",
                      )}
                    >
                      <span className="inline-flex items-center gap-0.5 justify-end">
                        {positive ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {Math.abs(entry.delta)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {entry.note ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </ScrollArea>

      <AdjustmentModal
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
      />
    </>
  );
}

function labelFor(reason: LedgerReason): string {
  switch (reason) {
    case "sale":
      return "Penjualan";
    case "refund":
      return "Refund";
    case "purchase":
      return "Pembelian";
    case "adjustment":
      return "Penyesuaian";
    case "audit":
      return "Audit";
    case "opening":
      return "Opening";
  }
}

type KpiTone = "warning" | "success";

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: KpiTone;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            tone === "warning"
              ? "bg-warning-soft text-warning-foreground"
              : tone === "success"
                ? "bg-success-soft text-success"
                : "bg-foreground/5",
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tnum">
        {value}
      </p>
      {hint && (
        <p className="text-[11px] text-muted-foreground mt-0.5 tnum">{hint}</p>
      )}
    </div>
  );
}

