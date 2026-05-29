import { z } from "zod";

export const unitFormSchema = z.object({
  id: z.string().optional(),
  unitName: z.string().min(1, "Nama satuan wajib diisi"),
  price: z.number().nonnegative("Harga harus ≥ 0"),
  costPrice: z.number().nonnegative().optional(),
  conversionToBase: z.number().positive("Rasio harus > 0"),
  isBase: z.boolean(),
  sku: z.string().optional(),
});

export type UnitFormData = z.infer<typeof unitFormSchema>;

export const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama produk wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().optional(),
  barcode: z.string().optional(),
  units: z
    .array(unitFormSchema)
    .min(1, "Minimal satu satuan harga"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
