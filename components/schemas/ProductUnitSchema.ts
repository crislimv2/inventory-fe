import { z } from "zod";

export const productUnitSchema = z.object({
    Id: z.string().min(1, "Unit ID is required"),
    product_id: z.string().min(1, "Product ID is required"),
    unitName: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export type ProductUnitFormData = z.infer<typeof productUnitSchema>;