export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    category?: string;
    brand?: string;
    barCode?: string;
    unitOfMeasure?: string;
    createdAt: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}