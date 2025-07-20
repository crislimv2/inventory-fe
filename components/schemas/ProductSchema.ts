import { z } from "zod";
import { productUnitSchema } from "./ProductUnitSchema";

export const productFormSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    units: z.array(productUnitSchema).nonempty("At least one unit is required"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;