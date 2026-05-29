"use client";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRpShort } from "@/lib/format";
import { usePos } from "@/lib/store/usePos";
import {
  bucketByDay,
  bucketByHour,
  bucketByMonth,
  loadAnalyticsData,
  paymentSplit,
  previousRange,
  rangeFor,
  topCategoriesByRevenue,
  topProducts,
  totalIn,
  type RangeKey,
} from "@/lib/analytics";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Hari ini" },
  { key: "week", label: "Minggu ini" },
  { key: "month", label: "Bulan ini" },
  { key: "year", label: "Tahun ini" },
  { key: "yoy", label: "YoY" },
];

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  debit: "Debit",
};

export function DashboardCanvas() {
  const hydrated = usePos((s) => s.hydrated);
  const products = usePos((s) => s.products);

  const [range, setRange] = useState<RangeKey>("today");

  const data = useMemo(() => (hydrated ? loadAnalyticsData() : null), [
    hydrated,
  ]);

  const productCategoryMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.category])),
    [products],
  );

  const now = useMemo(() => new Date(), [hydrated]);
  const currentRange = useMemo(
    () => rangeFor(range, now),
    [range, now],
  );
  const prevRange = useMemo(
    () => previousRange(currentRange),
    [currentRange],
  );

  // 4 KPIs always reflect today/week/month/year (independent of selected range).
  const kpis = useMemo(() => {
    if (!data) {
      return {
        today: { value: 0, prev: 0 },
        week: { value: 0, prev: 0 },
        month: { value: 0, prev: 0 },
        year: { value: 0, prev: 0 },
      };
    }
    const buckets: Record<"today" | "week" | "month" | "year", RangeKey> = {
      today: "today",
      week: "week",
      month: "month",
      year: "year",
    };
    const out: Record<string, { value: number; prev: number }> = {};
    for (const [k, rangeKey] of Object.entries(buckets)) {
      const cur = rangeFor(rangeKey, now);
      const prev = previousRange(cur);
      out[k] = {
        value: totalIn({ transactions: data.transactions, range: cur }),
        prev: totalIn({ transactions: data.transactions, range: prev }),
      };
    }
    return out as Record<
      "today" | "week" | "month" | "year",
      { value: number; prev: number }
    >;
  }, [data, now]);

  const todaySpark = useMemo(() => {
    if (!data) return undefined;
    return bucketByHour(data.transactions, now).map((b) => b.revenue);
  }, [data, now]);
  const weekSpark = useMemo(() => {
    if (!data) return undefined;
    return bucketByDay(data.transactions, rangeFor("week", now)).map(
      (b) => b.revenue,
    );
  }, [data, now]);
  const monthSpark = useMemo(() => {
    if (!data) return undefined;
    return bucketByDay(data.transactions, rangeFor("month", now)).map(
      (b) => b.revenue,
    );
  }, [data, now]);
  const yearSpark = useMemo(() => {
    if (!data) return undefined;
    return bucketByMonth(data.transactions, now.getFullYear()).map(
      (b) => b.revenue,
    );
  }, [data, now]);

  // Primary chart based on selected range.
  const primaryChart = useMemo(() => {
    if (!data) return { data: [], kind: "bar" as const };
    if (range === "today")
      return { data: bucketByHour(data.transactions, now), kind: "bar" as const };
    if (range === "week")
      return {
        data: bucketByDay(data.transactions, rangeFor("week", now)),
        kind: "line" as const,
      };
    if (range === "month")
      return {
        data: bucketByDay(data.transactions, rangeFor("month", now)),
        kind: "area" as const,
      };
    if (range === "year")
      return {
        data: bucketByMonth(data.transactions, now.getFullYear()),
        kind: "bar" as const,
      };
    // YoY
    const thisYear = bucketByMonth(data.transactions, now.getFullYear());
    const lastYear = bucketByMonth(
      data.transactions,
      now.getFullYear() - 1,
    );
    return {
      data: thisYear.map((m, i) => ({
        label: m.label,
        thisYear: m.revenue,
        lastYear: lastYear[i]?.revenue ?? 0,
      })),
      kind: "yoy" as const,
    };
  }, [data, range, now]);

  const topProductsRows = useMemo(() => {
    if (!data) return [];
    return topProducts(data.lines, currentRange, data.transactions, 5);
  }, [data, currentRange]);

  const categoryRows = useMemo(() => {
    if (!data) return [];
    return topCategoriesByRevenue(
      data.lines,
      currentRange,
      data.transactions,
      productCategoryMap,
      6,
    );
  }, [data, currentRange, productCategoryMap]);

  const paymentRows = useMemo(() => {
    if (!data) return [];
    return paymentSplit(data.transactions, currentRange);
  }, [data, currentRange]);

  const axisTickStyle = {
    fontSize: 11,
    fill: "var(--color-muted-foreground)",
  };

  return (
    <>
      <TopBarGlobal title="Dashboard" subtitle="Analitik penjualan" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-5">
          {/* Range picker */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {RANGES.map((r) => {
              const isActive = range === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={cn(
                    "shrink-0 h-9 px-3.5 rounded-full text-sm font-medium press-down transition-colors",
                    isActive
                      ? "bg-foreground text-background border border-foreground"
                      : "bg-card text-foreground border border-border hover:bg-accent",
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <MetricCard
              label="Hari ini"
              value={kpis.today.value}
              previous={kpis.today.prev}
              sparkline={todaySpark}
            />
            <MetricCard
              label="Minggu ini"
              value={kpis.week.value}
              previous={kpis.week.prev}
              sparkline={weekSpark}
            />
            <MetricCard
              label="Bulan ini"
              value={kpis.month.value}
              previous={kpis.month.prev}
              sparkline={monthSpark}
            />
            <MetricCard
              label="Tahun ini"
              value={kpis.year.value}
              previous={kpis.year.prev}
              sparkline={yearSpark}
            />
          </div>

          {/* Primary trend chart */}
          <ChartCard
            title={RANGES.find((r) => r.key === range)?.label ?? ""}
            subtitle="Pendapatan dalam rentang terpilih"
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              {primaryChart.kind === "bar" ? (
                <BarChart data={primaryChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
                  <Bar dataKey="revenue" name="Pendapatan" fill="var(--color-foreground)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              ) : primaryChart.kind === "line" ? (
                <LineChart data={primaryChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="var(--color-foreground)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              ) : primaryChart.kind === "area" ? (
                <AreaChart data={primaryChart.data}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="var(--color-foreground)" strokeWidth={2} fill="url(#rev)" isAnimationActive={false} />
                </AreaChart>
              ) : (
                <LineChart data={primaryChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="thisYear" name={`${now.getFullYear()}`} stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="lastYear" name={`${now.getFullYear() - 1}`} stroke="var(--color-muted-foreground)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartCard title="5 Produk Teratas" subtitle="Berdasarkan pendapatan" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsRows} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={axisTickStyle} width={140} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
                  <Bar dataKey="revenue" name="Pendapatan" fill="var(--color-foreground)" radius={[0, 6, 6, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribusi Kategori" subtitle="Berdasarkan pendapatan">
              {categoryRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada penjualan dalam rentang ini.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryRows} dataKey="revenue" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={1} isAnimationActive={false}>
                      {categoryRows.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Metode Pembayaran" subtitle="Pendapatan per metode" height={220}>
            {paymentRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentRows.map((p) => ({ ...p, method: PAYMENT_LABEL[p.method] ?? p.method }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="method" tick={axisTickStyle} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                  <YAxis tick={axisTickStyle} tickFormatter={(v) => formatRpShort(Number(v))} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
                  <Bar dataKey="revenue" name="Pendapatan" fill="var(--color-foreground)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Reference range info */}
          <p className="text-[11px] text-muted-foreground tnum">
            Rentang dipilih: {currentRange.start.toLocaleDateString("id-ID")} —{" "}
            {currentRange.end.toLocaleDateString("id-ID")} · sebelumnya{" "}
            {prevRange.start.toLocaleDateString("id-ID")} —{" "}
            {prevRange.end.toLocaleDateString("id-ID")}
          </p>
        </div>
      </ScrollArea>
    </>
  );
}
