"use client";
import { listTransactions, listLines } from "@/lib/store/repos/transactions";
import { Transaction, TransactionLine } from "@/lib/store/types";

export type RangeKey = "today" | "week" | "month" | "year" | "yoy";

export interface DateRange {
  start: Date;
  end: Date;
}

export function rangeFor(key: RangeKey, now = new Date()): DateRange {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  switch (key) {
    case "today":
      return { start, end };
    case "week": {
      const day = start.getDay();
      const diffToMon = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMon);
      return { start, end };
    }
    case "month": {
      start.setDate(1);
      return { start, end };
    }
    case "year": {
      start.setMonth(0, 1);
      return { start, end };
    }
    case "yoy": {
      start.setMonth(0, 1);
      const yoyStart = new Date(start);
      yoyStart.setFullYear(start.getFullYear() - 1);
      return { start: yoyStart, end };
    }
  }
}

export function previousRange(range: DateRange): DateRange {
  const span = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - span - 1),
    end: new Date(range.start.getTime() - 1),
  };
}

interface AggregateInput {
  transactions: Transaction[];
  range: DateRange;
}

export function totalIn({ transactions, range }: AggregateInput): number {
  return transactions
    .filter(
      (t) =>
        new Date(t.occurredAt) >= range.start &&
        new Date(t.occurredAt) <= range.end,
    )
    .reduce((s, t) => s + t.total, 0);
}

export function countIn({ transactions, range }: AggregateInput): number {
  return transactions.filter(
    (t) =>
      new Date(t.occurredAt) >= range.start &&
      new Date(t.occurredAt) <= range.end &&
      t.status !== "refunded",
  ).length;
}

export interface BucketPoint {
  label: string;
  revenue: number;
  count: number;
  ts: number;
}

export function bucketByHour(
  transactions: Transaction[],
  date = new Date(),
): BucketPoint[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const buckets: BucketPoint[] = Array.from({ length: 24 }, (_, h) => {
    const ts = new Date(start);
    ts.setHours(h);
    return {
      label: `${String(h).padStart(2, "0")}:00`,
      revenue: 0,
      count: 0,
      ts: ts.getTime(),
    };
  });

  for (const t of transactions) {
    const d = new Date(t.occurredAt);
    if (d < start || d >= end) continue;
    const h = d.getHours();
    buckets[h].revenue += t.total;
    if (t.status !== "refunded") buckets[h].count += 1;
  }
  return buckets;
}

export function bucketByDay(
  transactions: Transaction[],
  range: DateRange,
): BucketPoint[] {
  const days: BucketPoint[] = [];
  const cursor = new Date(range.start);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(range.end);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    days.push({
      label: cursor.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      revenue: 0,
      count: 0,
      ts: cursor.getTime(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const byKey = new Map(days.map((d, i) => [dateKey(new Date(d.ts)), i]));
  for (const t of transactions) {
    const k = dateKey(new Date(t.occurredAt));
    const i = byKey.get(k);
    if (i == null) continue;
    days[i].revenue += t.total;
    if (t.status !== "refunded") days[i].count += 1;
  }
  return days;
}

export function bucketByMonth(
  transactions: Transaction[],
  year: number,
): BucketPoint[] {
  const months: BucketPoint[] = Array.from({ length: 12 }, (_, m) => ({
    label: new Date(year, m, 1).toLocaleDateString("id-ID", {
      month: "short",
    }),
    revenue: 0,
    count: 0,
    ts: new Date(year, m, 1).getTime(),
  }));
  for (const t of transactions) {
    const d = new Date(t.occurredAt);
    if (d.getFullYear() !== year) continue;
    months[d.getMonth()].revenue += t.total;
    if (t.status !== "refunded") months[d.getMonth()].count += 1;
  }
  return months;
}

export function topProducts(
  lines: TransactionLine[],
  range: DateRange,
  transactions: Transaction[],
  limit = 5,
): { name: string; quantity: number; revenue: number }[] {
  const inRange = new Set(
    transactions
      .filter(
        (t) =>
          new Date(t.occurredAt) >= range.start &&
          new Date(t.occurredAt) <= range.end &&
          t.status !== "refunded",
      )
      .map((t) => t.id),
  );
  const tally = new Map<string, { quantity: number; revenue: number }>();
  for (const l of lines) {
    if (!inRange.has(l.transactionId)) continue;
    const cur = tally.get(l.productName) ?? { quantity: 0, revenue: 0 };
    cur.quantity += l.quantity;
    cur.revenue += l.lineTotal;
    tally.set(l.productName, cur);
  }
  return Array.from(tally.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function topCategoriesByRevenue(
  lines: TransactionLine[],
  range: DateRange,
  transactions: Transaction[],
  productCategoryMap: Map<string, string | undefined>,
  limit = 6,
): { name: string; revenue: number }[] {
  const inRange = new Set(
    transactions
      .filter(
        (t) =>
          new Date(t.occurredAt) >= range.start &&
          new Date(t.occurredAt) <= range.end &&
          t.status !== "refunded",
      )
      .map((t) => t.id),
  );
  const tally = new Map<string, number>();
  for (const l of lines) {
    if (!inRange.has(l.transactionId)) continue;
    const cat = productCategoryMap.get(l.productId) ?? "Lainnya";
    tally.set(cat, (tally.get(cat) ?? 0) + l.lineTotal);
  }
  const sorted = Array.from(tally.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  if (sorted.length <= limit) return sorted;
  const top = sorted.slice(0, limit - 1);
  const rest = sorted.slice(limit - 1).reduce((s, x) => s + x.revenue, 0);
  return [...top, { name: "Lainnya", revenue: rest }];
}

export function paymentSplit(
  transactions: Transaction[],
  range: DateRange,
): { method: string; revenue: number; count: number }[] {
  const tally = new Map<string, { revenue: number; count: number }>();
  for (const t of transactions) {
    const d = new Date(t.occurredAt);
    if (d < range.start || d > range.end) continue;
    if (t.status === "refunded") continue;
    const cur = tally.get(t.paymentMethod) ?? { revenue: 0, count: 0 };
    cur.revenue += t.total;
    cur.count += 1;
    tally.set(t.paymentMethod, cur);
  }
  return Array.from(tally.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function loadAnalyticsData(): {
  transactions: Transaction[];
  lines: TransactionLine[];
} {
  return {
    transactions: listTransactions(),
    lines: listLines(),
  };
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
