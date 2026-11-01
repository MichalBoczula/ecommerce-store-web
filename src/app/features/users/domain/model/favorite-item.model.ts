export interface FavoriteItemViewModel {
  productId: string;
  name: string;
  brand: string | null;
  mainPhoto: string | null;
  specifications: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  unavailable: boolean;
  addedAt: Date;
}
