"use client";
import { useState } from "react";
import { Modal } from "antd";
import { AlertTriangle, Check, RotateCcw, Store, X } from "lucide-react";
import { toast } from "sonner";
import { TopBarGlobal } from "@/components/shell/TopBarGlobal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePos } from "@/lib/store/usePos";

export function PengaturanCanvas() {
  const settings = usePos((s) => s.settings);
  const updateSettings = usePos((s) => s.updateSettings);
  const resetData = usePos((s) => s.resetData);

  const [name, setName] = useState(settings.merchant.name);
  const [address, setAddress] = useState(settings.merchant.address ?? "");
  const [phone, setPhone] = useState(settings.merchant.phone ?? "");
  const [taxId, setTaxId] = useState(settings.merchant.taxId ?? "");
  const [threshold, setThreshold] = useState(settings.lowStockThreshold);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [prevSettingsKey, setPrevSettingsKey] = useState(settings.merchant.name);

  // Sync local state when settings change externally (e.g. after reset).
  if (settings.merchant.name !== prevSettingsKey) {
    setPrevSettingsKey(settings.merchant.name);
    setName(settings.merchant.name);
    setAddress(settings.merchant.address ?? "");
    setPhone(settings.merchant.phone ?? "");
    setTaxId(settings.merchant.taxId ?? "");
    setThreshold(settings.lowStockThreshold);
  }

  const handleSave = () => {
    updateSettings({
      merchant: {
        name: name.trim() || "Toko",
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        taxId: taxId.trim() || undefined,
      },
      lowStockThreshold: Math.max(0, Math.floor(threshold)),
    });
    toast.success("Pengaturan disimpan");
  };

  const handleReset = () => {
    if (resetConfirm.trim().toUpperCase() !== "RESET") {
      toast.error("Ketik RESET untuk konfirmasi");
      return;
    }
    resetData();
    setResetOpen(false);
    setResetConfirm("");
    toast.success("Data demo telah di-reset ulang");
  };

  return (
    <>
      <TopBarGlobal title="Pengaturan" subtitle="Toko, data, & tampilan" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
          {/* Merchant */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Informasi Toko
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tampil pada struk dan QRIS.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Field label="Nama Toko">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                />
              </Field>
              <Field label="Alamat">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telepon">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                  />
                </Field>
                <Field label="NPWP / NPPKP">
                  <input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Inventaris */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Inventaris
              </h2>
              <p className="text-xs text-muted-foreground">
                Ambang batas stok untuk peringatan stok menipis.
              </p>
            </div>
            <Field label="Ambang Stok Menipis">
              <input
                type="number"
                value={threshold}
                onChange={(e) =>
                  setThreshold(Math.max(0, Number(e.target.value) || 0))
                }
                min={0}
                className="w-32 h-11 rounded-xl border border-border bg-card px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
              />
            </Field>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="h-11 px-5 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 press-down inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Simpan Pengaturan
            </button>
          </div>

          {/* Reset data */}
          <section className="rounded-2xl border border-destructive/40 bg-destructive-soft p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold tracking-tight">
                  Reset Data Demo
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hapus seluruh produk, transaksi, ledger, dan hold; lalu isi
                  ulang dengan data demo. Tindakan ini tidak bisa diurungkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="h-10 px-4 rounded-xl border border-destructive/40 bg-card text-destructive text-sm font-medium hover:bg-destructive hover:text-background transition-colors press-down inline-flex items-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Data
              </button>
            </div>
          </section>
        </div>
      </ScrollArea>

      <Modal
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        footer={null}
        width={420}
        centered
        destroyOnHidden
        closeIcon={
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </span>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Konfirmasi Reset
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ketik <span className="font-semibold tnum">RESET</span> untuk
                melanjutkan.
              </p>
            </div>
          </div>
          <input
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
            placeholder="RESET"
            className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm tnum tracking-wider focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetConfirm.trim().toUpperCase() !== "RESET"}
              className={cn(
                "h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
                "bg-destructive text-background hover:bg-destructive/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
