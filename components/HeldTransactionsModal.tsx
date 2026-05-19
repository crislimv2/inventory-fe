"use client";
import { Modal } from "antd";
import { Layers, Play, Trash2, ShoppingBag, Pencil, Check, X } from "lucide-react";
import { HeldTransaction } from "./interfaces/HeldTransaction";
import { formatRp, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  holds: HeldTransaction[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, label: string) => void;
  hasActiveCart: boolean;
};

export default function HeldTransactionsModal({
  isOpen,
  onClose,
  holds,
  onResume,
  onDelete,
  onRename,
  hasActiveCart,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const beginEdit = (h: HeldTransaction) => {
    setEditingId(h.id);
    setDraftLabel(h.label);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = draftLabel.trim();
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
    setDraftLabel("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftLabel("");
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Transaksi Ditahan
            </h2>
            <p className="text-xs text-muted-foreground">
              {holds.length} keranjang tersimpan · klik nama untuk ubah
            </p>
          </div>
        </div>

        {holds.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-dashed border-border bg-muted/30">
            <ShoppingBag className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Belum ada transaksi ditahan</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Gunakan tombol <span className="font-medium">Hold</span> di keranjang
              untuk menyimpan transaksi sementara.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-auto -mx-1 px-1">
            {holds.map((h) => {
              const isEditing = editingId === h.id;
              return (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border border-border bg-card",
                    "hover:border-foreground/20 hover:shadow-card transition-all",
                    isEditing && "border-foreground/30 shadow-card",
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold tnum">
                      {h.itemCount}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        onBlur={commitEdit}
                        maxLength={60}
                        className={cn(
                          "w-full text-sm font-medium bg-transparent border-0 px-0 py-0",
                          "focus:outline-none focus:ring-0",
                          "border-b border-foreground/30 rounded-none",
                        )}
                        aria-label="Nama transaksi"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => beginEdit(h)}
                        className="group/name flex items-center gap-1.5 text-sm font-medium truncate hover:text-foreground/80 w-full text-left"
                        title="Klik untuk ubah nama"
                      >
                        <span className="truncate">{h.label}</span>
                        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 shrink-0" />
                      </button>
                    )}
                    <p className="text-xs text-muted-foreground tnum">
                      {formatRp(h.subtotal)} ·{" "}
                      {formatTime(new Date(h.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            commitEdit();
                          }}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/90 press-down"
                          aria-label="Simpan nama"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            cancelEdit();
                          }}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
                          aria-label="Batal"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onResume(h.id)}
                          className={cn(
                            "h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium press-down",
                            "bg-foreground text-background hover:bg-foreground/90",
                          )}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Lanjut
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(h.id)}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {hasActiveCart && holds.length > 0 && (
          <p className="text-[11px] bg-warning-soft text-warning-foreground border border-warning/30 rounded-lg px-3 py-2">
            Keranjang aktif akan otomatis ditahan ketika Anda melanjutkan transaksi
            lain.
          </p>
        )}
      </div>
    </Modal>
  );
}
