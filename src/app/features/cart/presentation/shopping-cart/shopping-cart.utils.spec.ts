import { describe, expect, it } from 'vitest';
import { estimatedSubtotals, toCartItemViewModels } from './shopping-cart.utils';

const firstId = '11111111-1111-1111-1111-111111111111';
const secondId = '22222222-2222-2222-2222-222222222222';
const missingId = '33333333-3333-3333-3333-333333333333';
const unpricedId = '44444444-4444-4444-4444-444444444444';

describe('cart catalog enrichment', () => {
    it('preserves quantities, separates currency estimates, and excludes missing prices', () => {
        const items = toCartItemViewModels([
            { productId: firstId, quantity: 2 },
            { productId: secondId, quantity: 3 },
            { productId: missingId, quantity: 1 },
            { productId: unpricedId, quantity: 1 },
        ], [
            { id: firstId.toUpperCase(), name: 'A', price: { amount: 10, currency: 'USD' }, isFavorite: false },
            { id: secondId, name: 'B', price: { amount: 20, currency: 'EUR' }, isFavorite: false },
            { id: unpricedId, name: 'C', price: null, isFavorite: false },
        ]);

        expect(items.map(item => item.quantity)).toEqual([2, 3, 1, 1]);
        expect(items[2]).toMatchObject({ unavailable: true, priceAmount: null, priceCurrency: null });
        expect(items[3]).toMatchObject({ unavailable: false, priceAmount: null });
        expect(estimatedSubtotals(items)).toEqual([
            { currency: 'USD', amount: 20 }, { currency: 'EUR', amount: 60 },
        ]);
    });

    it('does not include a zero price that the Invoice order validator rejects', () => {
        const items = toCartItemViewModels([{ productId: firstId, quantity: 1 }], [
            { id: firstId, name: 'Free-looking phone', price: { amount: 0, currency: 'PLN' }, isFavorite: false },
        ]);
        expect(estimatedSubtotals(items)).toEqual([]);
    });
});
