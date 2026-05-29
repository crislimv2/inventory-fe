"use client";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Modal } from "antd";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRp } from "@/lib/format";
import { productFormSchema, type ProductFormData } from "@/lib/store/schemas";
import { Product, ProductUnit, newId } from "@/lib/store/types";
import { upsertProduct } from "@/lib/store/repos/products";
import {
  upsertManyUnits,
  deleteUnit,
} from "@/lib/store/repos/units";
import { usePos } from "@/lib/store/usePos";

type Props = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
};

export function ProductDrawer({ isOpen, product, onClose }: Props) {
  const allUnits = usePos((s) => s.units);
  const refreshCatalog = usePos((s) => s.refreshCatalog);
  const categories = usePos(
    useShallow((s) => {
      const set = new Set<string>();
      for (const p of s.products) if (p.category) set.add(p.category);
      return Array.from(set).sort();
    }),
  );

  const initialUnits = useMemo(() => {
    if (!product) return [];
    return allUnits.filter((u) => u.productId === product.id);
  }, [product, allUnits]);

  const defaults: ProductFormData = useMemo(
    () => ({
      id: product?.id,
      name: product?.name ?? "",
      category: product?.category ?? "",
      description: product?.description ?? "",
      barcode: product?.barcode ?? "",
      units:
        initialUnits.length > 0
          ? initialUnits.map((u) => ({
              id: u.id,
              unitName: u.unitName,
              price: u.price,
              costPrice: u.costPrice,
              conversionToBase: u.conversionToBase,
              isBase: u.isBase,
              sku: u.sku,
            }))
          : [
              {
                unitName: "Pcs",
                price: 0,
                costPrice: 0,
                conversionToBase: 1,
                isBase: true,
                sku: "",
              },
            ],
    }),
    [product, initialUnits],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaults,
    values: defaults,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const watchedUnits = watch("units");

  const onSubmit = (data: ProductFormData) => {
    const now = new Date().toISOString();
    const productId = data.id ?? newId("prod_");
    const productRecord: Product = {
      id: productId,
      name: data.name.trim(),
      category: data.category.trim(),
      description: data.description?.trim() || undefined,
      barcode: data.barcode?.trim() || undefined,
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
    };

    const incomingUnits: ProductUnit[] = data.units.map((u) => ({
      id: u.id ?? newId("u_"),
      productId,
      unitName: u.unitName.trim(),
      price: u.price,
      costPrice: u.costPrice,
      conversionToBase: u.conversionToBase ?? 1,
      isBase: u.isBase ?? true,
      sku: u.sku?.trim() || undefined,
    }));

    const incomingIds = new Set(incomingUnits.map((u) => u.id));
    const removed = initialUnits.filter((u) => !incomingIds.has(u.id));

    upsertProduct(productRecord);
    upsertManyUnits(incomingUnits);
    removed.forEach((u) => deleteUnit(u.id));
    refreshCatalog();

    toast.success(product ? "Produk diperbarui" : "Produk ditambahkan");
    reset();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      destroyOnHidden
      closeIcon={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <X className="h-4 w-4" />
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {product ? "Ubah Produk" : "Tambah Produk"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Lengkapi info produk dan minimal satu satuan harga.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Nama Produk
            </label>
            <input
              {...register("name")}
              placeholder="Mis. Indomie Goreng"
              className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Kategori
              </label>
              <input
                {...register("category")}
                list="produk-categories"
                placeholder="Mis. Minuman"
                className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
              />
              <datalist id="produk-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.category && (
                <p className="text-[11px] text-destructive mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Barcode (opsional)
              </label>
              <input
                {...register("barcode")}
                placeholder="089xxxx"
                className="mt-1 w-full h-11 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30 tnum"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Deskripsi (opsional)
            </label>
            <textarea
              {...register("description")}
              placeholder="Deskripsi singkat"
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Satuan & Harga</h3>
              <p className="text-[11px] text-muted-foreground">
                Setiap satuan punya harga jual dan harga modal.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                append({
                  unitName: "",
                  price: 0,
                  costPrice: 0,
                  conversionToBase: 1,
                  isBase: false,
                  sku: "",
                })
              }
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-accent press-down"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Satuan
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, idx) => {
              const watched = watchedUnits?.[idx];
              const margin =
                watched?.price && watched?.costPrice
                  ? watched.price - watched.costPrice
                  : 0;
              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-2 items-end">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Nama Satuan
                      </label>
                      <input
                        {...register(`units.${idx}.unitName`)}
                        placeholder="Pcs · Pack · Dus"
                        className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Harga Jual
                      </label>
                      <Controller
                        control={control}
                        name={`units.${idx}.price`}
                        render={({ field: ctl }) => (
                          <input
                            type="number"
                            value={ctl.value ?? 0}
                            onChange={(e) =>
                              ctl.onChange(Number(e.target.value) || 0)
                            }
                            min={0}
                            className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Harga Modal
                      </label>
                      <Controller
                        control={control}
                        name={`units.${idx}.costPrice`}
                        render={({ field: ctl }) => (
                          <input
                            type="number"
                            value={ctl.value ?? 0}
                            onChange={(e) =>
                              ctl.onChange(Number(e.target.value) || 0)
                            }
                            min={0}
                            className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm tnum focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/30"
                          />
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (fields.length <= 1) {
                          toast.error("Minimal satu satuan");
                          return;
                        }
                        remove(idx);
                      }}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
                      aria-label="Hapus satuan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground tnum">
                    <span>
                      Margin per unit:{" "}
                      <span className="font-medium text-foreground">
                        {formatRp(margin)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
            {errors.units && typeof errors.units.message === "string" && (
              <p className="text-[11px] text-destructive">
                {errors.units.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="col-span-1 h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors press-down"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "col-span-2 h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 press-down",
              "bg-foreground text-background hover:bg-foreground/90",
              "disabled:opacity-50",
            )}
          >
            <Check className="h-4 w-4" />
            {product ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
