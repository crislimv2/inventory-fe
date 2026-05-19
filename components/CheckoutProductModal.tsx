"use client";
import React, { useMemo, useState } from "react";
import CheckoutProductModalProps from "./interfaces/CheckoutProductModalProps";
import { InputNumber, Modal, QRCode, Segmented } from "antd";
import type { InputNumberProps } from "antd";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  LoaderCircleIcon,
  QrCode,
  Receipt,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { formatRp } from "@/lib/format";
import { cn } from "@/lib/utils";
import handleQRIS from "@/utils/handleQRIS";
import QRIS_CODE from "@/const/qr_code";
import QRCodeButton from "qrcode";
import SuccessPaymentModal from "./SuccessPaymentModal";

const ROUND_UPS = [1_000, 5_000, 10_000, 50_000];
const STANDARD_NOTES = [50_000, 100_000, 200_000, 500_000];

const buildQuickAmounts = (total: number): { value: number; label: string }[] => {
  if (total <= 0) return [];
  const set = new Set<number>();
  const items: { value: number; label: string }[] = [];

  items.push({ value: total, label: "Uang Pas" });
  set.add(total);

  for (const step of ROUND_UPS) {
    const rounded = Math.ceil(total / step) * step;
    if (rounded > total && !set.has(rounded)) {
      set.add(rounded);
      items.push({ value: rounded, label: formatRp(rounded) });
    }
  }
  for (const note of STANDARD_NOTES) {
    if (note >= total && !set.has(note)) {
      set.add(note);
      items.push({ value: note, label: formatRp(note) });
    }
  }
  return items.slice(0, 6);
};

const CheckoutProductModal: React.FC<CheckoutProductModalProps> = ({
  isOpen,
  onClose,
  cart,
  setCart,
  setIsCheckoutModalOpen,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRIS">("Cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrisLoading, setQrisLoading] = useState<boolean>(true);
  const [qrisData, setQrisData] = useState<string>(QRIS_CODE);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setPaymentMethod("Cash");
    setCashReceived(0);
    setSelectedAmount(null);
    setQrisLoading(true);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const totalAmount = useMemo(
    () =>
      cart.reduce((total, product) => {
        const productTotal =
          product.units?.reduce(
            (unitTotal, unit) =>
              unitTotal + (unit.price || 0) * (unit.quantity || 0),
            0,
          ) || 0;
        return total + productTotal;
      }, 0),
    [cart],
  );

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (acc, p) =>
          acc + (p.units?.reduce((s, u) => s + (u.quantity || 0), 0) || 0),
        0,
      ),
    [cart],
  );

  const quickAmounts = useMemo(
    () => buildQuickAmounts(totalAmount),
    [totalAmount],
  );

  const handleQrisRefresh = async () => {
    try {
      const qris = handleQRIS("ID10254493976740303UMI", totalAmount);
      setQrisData(qris);
    } catch (error) {
      console.error("Error fetching QRIS data:", error);
    } finally {
      setQrisLoading(false);
    }
  };

  const handleDownloadQRIS = async () => {
    try {
      const newQris = handleQRIS("ID10254493976740303UMI", totalAmount);
      setQrisData(newQris);
      const qrPng = await QRCodeButton.toDataURL(newQris);
      const link = document.createElement("a");
      link.href = qrPng;
      link.download = "qris.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download QR:", err);
    }
  };

  const handleQrisStatus = () => {
    if (totalAmount <= 0) return "expired";
    return qrisLoading ? "expired" : "active";
  };

  const handleRemoveItem = (productId: string, unitId: string) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === productId
            ? { ...p, units: p.units?.filter((u) => u.id !== unitId) }
            : p,
        )
        .filter((p) => (p.units?.length ?? 0) > 0),
    );
  };

  const formatter: InputNumberProps<number>["formatter"] = (value) => {
    if (!value && value !== 0) return "";
    const parts = value.toString().split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${integerPart}`;
  };

  const parser: InputNumberProps<number>["parser"] = (value) => {
    if (!value) return 0;
    return Number(value.replace(/[Rp\s.]/g, "")) || 0;
  };

  const change = cashReceived - totalAmount;
  const isCashShort = paymentMethod === "Cash" && cashReceived < totalAmount;
  const canConfirm =
    cart.length > 0 &&
    totalAmount > 0 &&
    (paymentMethod === "QRIS" || !isCashShort);

  const handleConfirm = () => {
    if (!canConfirm) return;
    setIsSuccessModalOpen(true);
  };

  let lineNumber = 0;

  return (
    <>
      <Modal
        width={1100}
        open={isOpen}
        onCancel={onClose}
        maskClosable={false}
        footer={null}
        destroyOnHidden
        className={isSuccessModalOpen ? "blur-sm" : ""}
        closeIcon={
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </span>
        }
        styles={{ content: { padding: 0, borderRadius: 16 } }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* LEFT — Order summary */}
          <section className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Pesanan</h2>
                <p className="text-xs text-muted-foreground tnum">
                  {totalItems} item dalam transaksi
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-border bg-card overflow-auto">
              <ul className="divide-y divide-border">
                {cart.map((product) =>
                  product.units?.map((unit) => {
                    lineNumber += 1;
                    return (
                      <li
                        key={`${product.id}-${unit.id}`}
                        className="flex items-start gap-3 px-3 py-3 group hover:bg-accent/40 transition-colors"
                      >
                        <span className="mt-0.5 inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-md bg-foreground/5 text-[10px] font-semibold tnum">
                          {lineNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground tnum mt-0.5">
                            {unit.quantity} {unit.unitName} ·{" "}
                            {formatRp(unit.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-semibold tnum">
                            {formatRp((unit.price || 0) * (unit.quantity || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product.id, unit.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            aria-label="Hapus item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  }),
                )}
                {cart.length === 0 && (
                  <li className="text-center text-sm text-muted-foreground py-10">
                    Keranjang kosong
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tnum">{formatRp(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="text-base font-semibold">Total</span>
                <span className="text-3xl font-semibold tnum tracking-tight">
                  {formatRp(totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT — Payment */}
          <section className="lg:col-span-3 p-6 flex flex-col min-h-[640px]">
            <h2 className="text-lg font-semibold tracking-tight mb-3">
              Pembayaran
            </h2>

            <Segmented
              size="large"
              className="w-full [&_.ant-segmented-item]:flex-1"
              value={paymentMethod}
              onChange={(val) => {
                setPaymentMethod(val as "Cash" | "QRIS");
                setCashReceived(0);
                setSelectedAmount(null);
                setQrisLoading(true);
              }}
              options={[
                {
                  label: (
                    <div className="flex items-center justify-center gap-2 py-1.5">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium">Tunai</span>
                    </div>
                  ),
                  value: "Cash",
                },
                {
                  label: (
                    <div className="flex items-center justify-center gap-2 py-1.5">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium">QRIS</span>
                    </div>
                  ),
                  value: "QRIS",
                },
              ]}
            />

            {paymentMethod === "Cash" && (
              <div className="flex-1 flex flex-col mt-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Uang diterima
                  </label>
                  <InputNumber<number>
                    autoFocus
                    style={{ width: "100%", marginTop: 6 }}
                    value={cashReceived || undefined}
                    onChange={(v) => {
                      setCashReceived(v ?? 0);
                      setSelectedAmount(null);
                    }}
                    onPressEnter={handleConfirm}
                    controls={false}
                    placeholder="Rp 0"
                    size="large"
                    formatter={formatter}
                    parser={parser}
                  />
                </div>

                {quickAmounts.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Nominal cepat
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt.value}
                          type="button"
                          onClick={() => {
                            setCashReceived(amt.value);
                            setSelectedAmount(amt.value);
                          }}
                          className={cn(
                            "h-12 rounded-xl border text-sm font-medium press-down transition-all",
                            "flex flex-col items-center justify-center leading-tight",
                            selectedAmount === amt.value
                              ? "bg-foreground text-background border-foreground shadow-card"
                              : "bg-card border-border hover:bg-accent hover:border-foreground/20",
                          )}
                        >
                          <span className="text-[10px] uppercase tracking-wide opacity-70">
                            {amt.label === "Uang Pas" ? amt.label : ""}
                          </span>
                          <span className="tnum">
                            {amt.label === "Uang Pas"
                              ? formatRp(amt.value)
                              : amt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Big kembalian display */}
                <div
                  className={cn(
                    "mt-auto rounded-2xl border p-5 transition-colors",
                    cashReceived <= 0
                      ? "bg-muted/40 border-border"
                      : isCashShort
                        ? "bg-warning-soft border-warning/40"
                        : "bg-success-soft border-success/40",
                  )}
                >
                  {cashReceived <= 0 ? (
                    <div className="text-center text-muted-foreground py-2">
                      <p className="text-xs uppercase tracking-wide">
                        Kembalian
                      </p>
                      <p className="text-2xl font-semibold tnum mt-1">
                        {formatRp(0)}
                      </p>
                    </div>
                  ) : isCashShort ? (
                    <>
                      <div className="flex items-center gap-2 text-warning-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Kurang
                        </span>
                      </div>
                      <p className="text-4xl font-semibold tnum tracking-tight mt-2 text-warning-foreground">
                        {formatRp(Math.abs(change))}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Kembalian
                        </span>
                      </div>
                      <p className="text-5xl font-semibold tnum tracking-tight mt-2 text-success">
                        {formatRp(change)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === "QRIS" && (
              <div className="flex-1 flex flex-col mt-4 items-center">
                <div className="text-center max-w-xs">
                  <h3 className="text-sm font-semibold">Toko Ci Ali, GRGL PTM</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    Jl. Jelambar Jaya 4 No. 18, Jelambar Baru, Grogol Petamburan,
                    Jakarta Barat
                  </p>
                </div>

                <div className="mt-4 w-full max-w-sm rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
                    <Image
                      src="/qris_icon.jpg"
                      width={64}
                      height={24}
                      alt="QRIS"
                      className="h-6 w-auto object-contain"
                      draggable={false}
                    />
                    <span className="text-lg font-semibold tnum">
                      {formatRp(totalAmount)}
                    </span>
                  </div>
                  <div className="p-5 flex justify-center">
                    <div className="relative p-4 bg-white rounded-xl border border-border">
                      <QRCode
                        type="canvas"
                        value={qrisData}
                        onRefresh={handleQrisRefresh}
                        status={handleQrisStatus()}
                        size={200}
                        bordered={false}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                    <p className="text-[11px] text-muted-foreground">
                      Scan dengan aplikasi e-wallet apa saja
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadQRIS}
                      className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent press-down"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={cn(
                "mt-5 h-14 w-full rounded-xl text-base font-semibold inline-flex items-center justify-center gap-2 press-down",
                "bg-foreground text-background hover:bg-foreground/90",
                "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
              )}
            >
              {isSuccessModalOpen ? (
                <LoaderCircleIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Konfirmasi · {formatRp(totalAmount)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </section>
        </div>
      </Modal>

      <SuccessPaymentModal
        isOpen={isSuccessModalOpen}
        paymentMethod={paymentMethod}
        onClose={() => {
          onClose();
          setIsSuccessModalOpen(false);
        }}
        products={cart}
        setCart={setCart}
        totalAmount={totalAmount}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        cashReceived={cashReceived}
      />
    </>
  );
};

export default CheckoutProductModal;
