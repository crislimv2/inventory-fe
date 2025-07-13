export interface ProductUnit {
    unitId: string;
    product_id: string;
    unitName: string;   // "Kg", "Pack", etc.
    price: number;
    quantity: number;
}

export const dummyProductUnit: ProductUnit[] = [
    {
        unitId: "f93aef58-7754-4bc1-808a-ffa6fbbda987",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "Kg",
        price: 12000,
        quantity: 0,
    },
    {
        unitId: "c0c3da59-cca8-4142-81a5-579ecf9611c3",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "1/2 Kg",
        price: 6000,
        quantity: 0,
    },
    {
        unitId: "2880eaf5-ffce-425d-a2a7-85d30dbb2af7",
        product_id: "802bec62-0de3-4f87-b7d2-707c74f78f5e",
        unitName: "1/4 Kg",
        price: 3000,
        quantity: 0,
    },
]
