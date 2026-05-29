# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Before any UI/UX work, read [.agents/frontend-design-taste.md](.agents/frontend-design-taste.md)** — the senior-level, project-agnostic taste skill (lifecycle, anti-slop patterns, hydration discipline, pre-flight checklist). Architecture/file-layout notes below; visual & interaction rules live there.

## Commands

- `npm run dev` — Start the Next.js dev server (http://localhost:3000).
- `npm run build` — Production build.
- `npm run start` — Run the production build.
- `npm run lint` — ESLint (uses `eslint-config-next` core-web-vitals + typescript).

There is no test runner configured.

## Architecture

Multi-section POS (Toko Ci Ali, Jakarta Barat). Next.js 16 / React 19 / Tailwind v4 / Ant Design 5 / shadcn-ui / Zustand / Recharts. Fully client-side; **localStorage is the source of truth**, seeded on first boot with ~600 backdated demo transactions so the dashboard renders meaningfully.

### Routes

Root `src/app/page.tsx` redirects to `/kasir`. The app shell lives in the `(app)` route group:

```
src/app/
  layout.tsx                  // ThemeProvider + Toaster
  page.tsx                    // redirect("/kasir")
  (app)/
    layout.tsx                // Shell: <LeftRail/> + main
    kasir/page.tsx            // Cashier (sale flow)
    produk/page.tsx           // Product CRUD + units
    stok/page.tsx             // KPI rail + ledger + adjustments
    dashboard/page.tsx        // Analytics (Recharts)
    riwayat/page.tsx          // Transaction history + reprint + refund
    pengaturan/page.tsx       // Merchant info + reset data
```

The shell mounts a single `<PosBoot/>` client component that triggers `usePos().hydrate()` — runs migrations, ensures seed, then loads products / units / stock / holds / settings into the Zustand store.

### State & persistence

The app's authoritative store layer lives in `src/lib/store/`:

- `types.ts` — Product, ProductUnit, StockSnapshot, LedgerEntry, Transaction, TransactionLine, Hold, AuditSession, Settings, CartLine + helpers `newId`, `transactionCode`.
- `storage.ts` — typed localStorage wrapper, namespaced keys (`pos:v1:*`), in-memory mirror, `writeMany` for atomic batched writes.
- `migrations.ts` — versioned migrators; `getMeta`/`setMeta`.
- `seed.ts` — derives products from `dummyData` and generates backdated transactions + ledger entries.
- `repos/{products,units,ledger,transactions,holds,settings,audits}.ts` — pure repo functions per entity. Sale and refund commits write atomically across transactions + lines + ledger + stock via `writeMany`.
- `stockOps.ts` — `recordMovement` / `recordPurchase` / `recordAudit` helpers that append ledger entries and update the stock cache.
- `schemas.ts` — Zod schemas for product/unit forms (used by `ProductDrawer`).
- `usePos.ts` — Zustand store: cached products/units/stock/holds/settings + cart state. Exposes selectors (`stockOf`, `unitsOf`, `cartTotal`, `cartItemCount`, `heldCount`, `categoriesOf`) and actions (`hydrate`, `resetData`, `refreshCatalog`, cart ops, hold ops, `afterSaleCommit`, `updateSettings`).

### Section components

Each section has its own folder under `src/components/`:

- `shell/` — `LeftRail`, `TopBarGlobal`, `PosBoot`, `ComingSoon`.
- `kasir/` — `KasirCanvas`, `KasirHeader`, `CartPane`, `ProductCard` (in `src/components/`), `UnitPickerModal`, `CheckoutModal`, `SuccessSheet`, `HoldsModal`.
- `produk/` — `ProdukCanvas`, `ProductDrawer` (RHF + Zod field-array for units).
- `stok/` — `StokCanvas`, `AdjustmentModal`.
- `dashboard/` — `DashboardCanvas`, `MetricCard` (with sparkline), `ChartCard`, `ChartTooltip`. Charts use Recharts wired to `--color-chart-*` / `--color-foreground` tokens so dark mode is automatic.
- `riwayat/` — `RiwayatCanvas`, `TransactionDetailModal`, `RefundModal`.
- `pengaturan/` — `PengaturanCanvas` (merchant info, low-stock threshold, typed-confirm reset flow).

### Two parallel `components` directories — pay attention

The project has **two** component roots:

- `src/components/...` — resolvable via `@/components/...`. Holds shadcn UI primitives in `src/components/ui/` plus every section component.
- `components/` (repo root) — **not** under the `@/` alias. Holds `interfaces/`, `schemas/`, `constants/`, and the seed-data sources (`Product.ts`, `ProductUnit.ts`). Imported by relative path (e.g. `../../../components/interfaces/Product` from inside `src/lib/store/`).

Path alias: `@/* → src/*` only.

### Sale → Ledger atomicity

`commitSale()` in `repos/transactions.ts` builds a `Transaction` + per-line `TransactionLine`s (with frozen price/name snapshots) + negative-delta `LedgerEntry`s + an updated `StockSnapshot[]`, then writes all four via a single `writeMany({transactions, lines, ledger, stock})`. Failures restore the in-memory cache and throw. `commitRefund()` mirrors this with positive deltas and a new `refunded` transaction that links via `refundOfId`; the original transaction's status flips to `refunded` or `partially_refunded`.

### Checkout & QRIS

`CheckoutModal.tsx` supports Cash / QRIS. QRIS payloads are generated locally in `src/utils/handleQRIS.tsx` (EMV TLV + CRC16/CCITT-FALSE). Merchant constants are hardcoded in `handleQRIS` and read from `usePos().settings.merchant` for receipt display. `SuccessSheet.tsx` shows the receipt summary and exposes a thermal-print path.

### UI stack — two component libraries coexist

Both **Ant Design 5** and **shadcn/ui (new-york style, neutral base)** are in use:

- shadcn primitives (Button, Card, Input, ScrollArea, Separator, Sonner) live in `src/components/ui/`. Use `cn()` from `@/lib/utils` for class merging.
- Ant Design is used for `Modal`, `InputNumber`, `QRCode`, `Segmented`. AntD modal/input chrome is themed via overrides in `globals.css` (`destroyOnHidden`, rounded radius, semantic color tokens).

Tailwind v4 via `@tailwindcss/postcss`, CSS variables in `src/app/globals.css` (light + dark). Icons are Lucide. Toasts are Sonner.

### Hydration discipline

- `useHydrated()` (in `src/lib/useHydrated.ts`) gates every theme/locale/Recharts-width-dependent render so server and first client render produce identical markup.
- The clock uses `useSyncExternalStore` with a cached snapshot so React's `getSnapshot` is stable.
- State-reset on prop change uses the React 19 "setState during render with prev-prop guard" pattern; **never** `useEffect(() => setState(deriveFromProp(prop)), [prop])`. When comparing `prop?.id ?? null` to a state value, normalize both sides to `null` to avoid `undefined !== null` infinite loops.

### Other notes

- Currency formatting via `formatRp` / `formatRpShort` / `parseRp` in `src/lib/format.ts`. Indonesian locale (`Rp 50.000`). Use `tnum` on every comparable number.
- Barcode scanner: `src/lib/useBarcodeScanner.ts` listens for rapid-burst keyboard input + Enter; product lookup hits `barcode` → `id` → `name`.
- `ngrok.exe` is committed at the repo root.
