import { describe, expect, it } from 'vitest';
import { toFavoriteItemViewModels } from './favorites.component.utils';

const firstId = '11111111-1111-1111-1111-111111111111';
const missingId = '22222222-2222-2222-2222-222222222222';

describe('favorite catalog enrichment', () => {
    it('uses the fetched IDs and does not invent a price or currency for missing products', () => {
        const items = toFavoriteItemViewModels([
            { id: 'a', clientId: 'c', productId: firstId, addedAt: new Date() },
            { id: 'b', clientId: 'c', productId: missingId, addedAt: new Date() },
        ], [{ id: firstId.toUpperCase(), name: 'Beyond page 1', price: { amount: 31, currency: 'PLN' }, isFavorite: false }]);

        expect(items[0]).toMatchObject({ name: 'Beyond page 1', unavailable: false, priceAmount: 31, priceCurrency: 'PLN' });
        expect(items[1]).toMatchObject({ name: 'Product unavailable', unavailable: true, priceAmount: null, priceCurrency: null });
    });
});
