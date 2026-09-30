import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';
import { MobilePhone } from '../../../mobile-phones/domain/model/mobile-phone';

export interface CartItemViewModel extends ShoppingCartLineResponse {
    name: string;
    brand: string | null;
    unavailable: boolean;
    priceAmount: number | null;
    priceCurrency: string | null;
}

export interface EstimatedSubtotal {
    currency: string;
    amount: number;
}

export function toCartItemViewModels(
    lines: readonly ShoppingCartLineResponse[],
    products: readonly MobilePhone[]
): CartItemViewModel[] {
    const byId = new Map(products.map(product => [product.id.toLowerCase(), product]));
    return lines.map(line => {
        const product = byId.get(line.productId.toLowerCase());
        return {
            ...line,
            name: product?.name || (product ? 'Unnamed product' : 'Product unavailable'),
            brand: product?.brand ?? null,
            unavailable: !product,
            priceAmount: product?.price?.amount ?? null,
            priceCurrency: product?.price?.currency || null,
        };
    });
}

export function estimatedSubtotals(items: readonly CartItemViewModel[]): EstimatedSubtotal[] {
    const totals = new Map<string, number>();
    for (const item of items) {
        if (item.unavailable || item.priceAmount === null || !Number.isFinite(item.priceAmount) ||
            item.priceAmount <= 0 ||
            !item.priceCurrency) continue;
        const currency = item.priceCurrency.toUpperCase();
        totals.set(currency, (totals.get(currency) ?? 0) + item.priceAmount * item.quantity);
    }
    return [...totals].map(([currency, amount]) => ({ currency, amount }));
}
