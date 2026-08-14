export interface ShoppingCartLineRequest {
    productId: string;
    name: string;
    brand?: string | null;
    unitPriceAmount: number;
    unitPriceCurrency: string;
    quantity: number;
}