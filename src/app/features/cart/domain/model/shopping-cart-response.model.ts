import { ShoppingCartLineResponse } from './shopping-cart-line-response.model';

export interface ShoppingCartResponse {
    id: string;
    clientId: string;
    lines: ShoppingCartLineResponse[];
    totalAmount: number;
    totalCurrency: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}