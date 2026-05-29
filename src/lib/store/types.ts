export type ID = string;

export interface Product {
  id: ID;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface ProductUnit {
  id: ID;
  productId: ID;
  unitName: string;
  price: number;
  costPrice?: number;
  conversionToBase: number;
  isBase: boolean;
  sku?: string;
  imageUrl?: string;
}

export interface StockSnapshot {
  productUnitId: ID;
  onHand: number;
  lastMovementAt: string;
}

export type LedgerReason =
  | "sale"
  | "refund"
  | "purchase"
  | "adjustment"
  | "audit"
  | "opening";

export interface LedgerEntry {
  id: ID;
  productUnitId: ID;
  delta: number;
  reason: LedgerReason;
  refType?: "transaction" | "audit" | "purchase" | "manual";
  refId?: ID;
  note?: string;
  occurredAt: string;
  createdAt: string;
  createdBy?: string;
}

export type PaymentMethod = "cash" | "qris" | "debit";

export type TransactionStatus =
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "void";

export interface Transaction {
  id: ID;
  code: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  cashTendered?: number;
  change?: number;
  customerName?: string;
  occurredAt: string;
  refundOfId?: ID;
  cashierId?: string;
}

export interface TransactionLine {
  id: ID;
  transactionId: ID;
  productId: ID;
  productUnitId: ID;
  productName: string;
  unitName: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface HoldLine {
  productId: ID;
  productUnitId: ID;
  productName: string;
  unitName: string;
  price: number;
  quantity: number;
}

export interface Hold {
  id: ID;
  label: string;
  lines: HoldLine[];
  createdAt: string;
  subtotal: number;
  itemCount: number;
}

export interface AuditLine {
  productUnitId: ID;
  countedQty: number;
  expectedQty: number;
  delta: number;
}

export interface AuditSession {
  id: ID;
  startedAt: string;
  finishedAt?: string;
  lines: AuditLine[];
  note?: string;
}

export interface MerchantInfo {
  name: string;
  address?: string;
  taxId?: string;
  phone?: string;
}

export interface Settings {
  merchant: MerchantInfo;
  currency: string;
  locale: string;
  lowStockThreshold: number;
  demoSeedVersion: number;
}

export interface CartLine {
  productId: ID;
  productUnitId: ID;
  productName: string;
  unitName: string;
  price: number;
  quantity: number;
}

export function newId(prefix = ""): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 14);
  return prefix + rnd;
}

export function transactionCode(date: Date, seq: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `TRX-${y}${m}${d}-${String(seq).padStart(4, "0")}`;
}
