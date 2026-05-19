# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start the Next.js dev server (http://localhost:3000).
- `npm run build` — Production build.
- `npm run start` — Run the production build.
- `npm run lint` — ESLint (uses `eslint-config-next` core-web-vitals + typescript).

There is no test runner configured.

## Architecture

This is a Next.js 16 / React 19 single-page POS (point-of-sale) UI for a small store (Toko Ci Ali, Jakarta Barat). It runs entirely client-side from in-memory dummy data — there is no backend, no routing beyond the root `/`, and no persistence. State lives in the top-level `Card` component and is passed down via props.

### Two parallel `components` directories — pay attention

The project has **two** component roots that both get imported, and the `@/` alias only covers one of them:

- `src/components/...` — resolvable via `@/components/...` (configured in `tsconfig.json` paths and `components.json`). Contains the shadcn UI primitives in `src/components/ui/` and the two "reusable" widgets `ProductCard.tsx` and `CartSidebar.tsx`.
- `components/` (repo root) — **not** under the `@/` alias. Contains the page-level / feature components (`Card.tsx`, `SelectedProductModal.tsx`, `CheckoutProductModal.tsx`, `SuccessPaymentModal.tsx`) plus `interfaces/`, `schemas/`, `constants/`. These are imported using **relative paths** (e.g. `../../components/interfaces/Product` from inside `src/components/`).

When adding files, follow the existing split: shadcn/ui-style primitives and small presentational components go under `src/components/`; feature modals and the orchestrating `Card` go under root `components/`. Cross-imports between the two directories already exist and are expected.

### Data flow

`src/app/page.tsx` renders `<Card />` (from root `components/Card.tsx`), which is the entire app shell. `Card.tsx` owns:

- `cart: Product[]` — the source of truth for the shopping cart.
- `selectedProduct`, modal open flags, `searchQuery`.

A `Product` (`components/interfaces/Product.ts`) contains a `units: ProductUnit[]` array. **Quantity lives on each unit, not on the product** — a single `Product` in the cart can have multiple `ProductUnit` entries each with their own `price` and `quantity`. Most cart logic (totals, add, remove, merge) iterates units inside products. The product is removed from the cart only when its `units` array becomes empty.

Product catalog is the hardcoded `dummyData` export in `components/interfaces/Product.ts`. There is no API layer.

Sort order in the grid (in `Card.tsx`): items already in cart → items that have any defined units → alphabetical. Many catalog entries have `units: []` and so cannot be added to the cart at all.

### Checkout & QRIS

`CheckoutProductModal.tsx` supports Cash / QRIS / Debit. QRIS payloads are generated **locally** in `src/utils/handleQRIS.tsx` — it builds an EMV QR string (TLV format) with the merchant constants hardcoded (`ID10254493976740303UMI`, "Toko Ci Ali, GRGL PTM", "JAKARTA BARAT") and appends a CRC16/CCITT-FALSE checksum. The base template `QRIS_CODE` in `src/const/qr_code.tsx` is a fallback used before the amount-specific payload is generated. There is no server validation of payment — completing the "paid" action just opens `SuccessPaymentModal`.

### UI stack — two component libraries coexist

Both **Ant Design 5** and **shadcn/ui (new-york style, neutral base)** are in use simultaneously:

- shadcn primitives (Button, Card, Input, ScrollArea, Separator, Sonner) live in `src/components/ui/`. Use `cn()` from `@/lib/utils` for class merging.
- Ant Design is used for `Modal`, `InputNumber`, `QRCode`, `Segmented`, and Ant's own `Button` (often imported into the same file as the shadcn `Button` — they coexist).

Tailwind v4 is configured via `@tailwindcss/postcss` and CSS variables (no `tailwind.config.*` file — see `components.json` and `src/app/globals.css`). Icons are Lucide. Toasts are Sonner (mounted globally in `src/app/layout.tsx`).

### Other notes

- Currency formatting throughout uses Indonesian locale (`toLocaleString('id-ID')`, `Rp ` prefix, `.` as thousands separator). The cart's `InputNumber` formatter/parser in `CartSidebar.tsx` round-trips this format.
- `ngrok.exe` is committed at the repo root (used for exposing the dev server externally).
- Path alias: `@/* → src/*` only. Anything in root `components/` must be imported relatively.
