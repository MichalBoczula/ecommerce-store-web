export interface ProductSnapshot {
    id: string;
    productId: string;
    name: string;
    brand: string;
    priceAmount: number;
    priceCurrency: string;
}

export interface OrderLine {
    productVersionId: string;
    quantity: number;
    productVersion: ProductSnapshot;
    lineTotalAmount: number;
}

export interface Order {
    id: string;
    clientId: string;
    createdAt: Date;
    updatedAt: Date | null;
    status: string;
    totalAmount: number;
    totalCurrency: string;
    lines: OrderLine[];
}
