"use client";
import { useMemo, useState } from "react";
import { ReceiptText, Search, X } from "lucide-react";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatRp, formatDate, formatTime } from "@/lib/format";
import { usePos } from "@/lib/store/usePos";
import { listTransactions } from "@/lib/store/repos/transactions";
import { Transaction } from "@/lib/store/types";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { RefundModal } from "./RefundModal";

const STATUS_LABEL: Record<Transaction["status"], string> = {
  paid: "Lunas",
  refunded: "Refund",
  partially_refunded: "Refund Sebag.",
  void: "Batal",
};

const STATUS_FILTERS: { value: "all" | Transaction["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "paid", label: "Lunas" },
  { value: "partially_refunded", label: "Refund Sebagian" },
  { value: "refunded", label: "Refund" },
];

const METHOD_LABEL: Record<Transaction["paymentMethod"], string> = {
  cash: "Tunai",
  qris: "QRIS",
  debit: "Debit",
};

export function RiwayatCanvas() {
  const hydrated = usePos((s) => s.hydrated);
  const cartHash = usePos((s) => s.cart.length); // re-trigger when sales happen
  const stockHash = usePos((s) => s.stock.length);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Transaction["status"]
  >("all");
  const [methodFilter, setMethodFilter] = useState<
    "all" | Transaction["paymentMethod"]
  >("all");
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [refundFor, setRefundFor] = useState<Transaction | null>(null);

  const transactions = useMemo(() => {
    if (!hydrated) return [];
    void cartHash;
    void stockHash;
    return listTransactions().sort((a, b) =>
      a.occurredAt > b.occurredAt ? -1 : 1,
    );
  }, [hydrated, cartHash, stockHash]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (methodFilter !== "all" && t.paymentMethod !== methodFilter)
        return false;
      if (!q) return true;
      return (
        t.code.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q)
      );
    });
  }, [transactions, query, statusFilter, methodFilter]);

  return (
    <>
      <TopBarGlobal title="Riwayat Transaksi" subtitle="Penjualan & refund" />

      <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode transaksi atau pelanggan"
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "shrink-0 h-9 px-3 rounded-full text-xs font-medium press-down transition-colors",
                  active
                    ? "bg-foreground text-background border border-foreground"
                    : "bg-card text-foreground border border-border hover:bg-accent",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <select
          value={methodFilter}
          onChange={(e) =>
            setMethodFilter(
              e.target.value as "all" | Transaction["paymentMethod"],
            )
          }
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Filter metode"
        >
          <option value="all">Semua metode</option>
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="debit">Debit</option>
        </select>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {!hydrated ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <ReceiptText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Tidak ada transaksi</p>
            <p className="text-xs text-muted-foreground mt-1">
              Filter atau kata kunci tidak menemukan hasil.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-semibold">Kode</th>
                <th className="px-3 py-3 font-semibold">Waktu</th>
                <th className="px-3 py-3 font-semibold">Metode</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setDetail(t)}
                  className="hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3 tnum font-medium">{t.code}</td>
                  <td className="px-3 py-3">
                    <p className="text-xs tnum">
                      {formatDate(new Date(t.occurredAt))}
                    </p>
                    <p className="text-[11px] text-muted-foreground tnum">
                      {formatTime(new Date(t.occurredAt))}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {METHOD_LABEL[t.paymentMethod]}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-md",
                        t.status === "paid"
                          ? "bg-success-soft text-success"
                          : t.status === "partially_refunded"
                            ? "bg-warning-soft text-warning-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 text-right tnum font-semibold",
                      t.total < 0 && "text-destructive",
                    )}
                  >
                    {formatRp(t.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ScrollArea>

      <TransactionDetailModal
        isOpen={detail !== null}
        transaction={detail}
        onClose={() => setDetail(null)}
        onRefund={() => {
          setRefundFor(detail);
          setDetail(null);
        }}
      />

      <RefundModal
        isOpen={refundFor !== null}
        transaction={refundFor}
        onClose={() => setRefundFor(null)}
      />
    </>
  );
}
