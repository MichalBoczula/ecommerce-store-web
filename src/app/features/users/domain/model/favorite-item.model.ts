export interface FavoriteItemViewModel {
    productId: string;
    name: string;
    brand: string | null;
    priceAmount: number;
    priceCurrency: string;
    addedAt: Date;
}