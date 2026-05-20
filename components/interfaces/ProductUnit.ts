export interface ProductUnit {
    id: string;
    product_id: string; // UUID of the product this unit belongs to
    unitName: string;   // "Kg", "Pack", etc.
    price: number;
    quantity: number;
    imageUrl?: string;  // optional per-variant image; falls back to generated artwork
}

export const dummyProductUnit: ProductUnit[] = [
    {
        id: "f93aef58-7754-4bc1-808a-ffa6fbbda987",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Kg",
        price: 12000,
        quantity: 0,
    },
    {
        id: "c0c3da59-cca8-4142-81a5-579ecf9611c3",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "1/2 Kg",
        price: 6000,
        quantity: 0,
    },
    {
        id: "2880eaf5-ffce-425d-a2a7-85d30dbb2af7",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "1/4 Kg",
        price: 3000,
        quantity: 0,
    },
    {
        id: "d1b2c3f4-5678-9abc-def0-1234567890ab",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "1/8 Kg",
        price: 3000,
        quantity: 0,
    },
    {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        product_id: "702bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Dus",
        price: 200000,
        quantity: 0,
    },
    {
        id: "b1c2d3e4-f5a6-7890-bcde-f12345678901",
        product_id: "702bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Box",
        price: 45000,
        quantity: 0,
    },
    {
        id: "c1d2e3f4-a5b6-7890-cdef-123456789012",
        product_id: "702bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Pack",
        price: 15000,
        quantity: 0,
    },
    {
        id: "d1e2f3g4-h5i6-7890-jklm-n12345678901",
        product_id: "702bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Sachet",
        price: 5000,
        quantity: 0,
    }


]
