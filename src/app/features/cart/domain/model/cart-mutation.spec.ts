import { describe, expect, it } from 'vitest';
import { applyCartMutation, CartValidationError } from './cart-mutation';

const phoneId = '11111111-1111-1111-1111-111111111111';
const secondId = '22222222-2222-2222-2222-222222222222';

describe('cart mutations', () => {
    it('adds to an existing line without losing other products or sending catalog data', () => {
        const lines = [
            { productId: phoneId, quantity: 2 },
            { productId: secondId, quantity: 4 },
        ];

        expect(applyCartMutation(lines, { kind: 'add', productId: phoneId.toUpperCase(), quantity: 3 }))
            .toEqual([{ productId: phoneId, quantity: 5 }, { productId: secondId, quantity: 4 }]);
        expect(lines[0].quantity).toBe(2);
    });

    it('adds a new product and increments its quantity', () => {
        expect(applyCartMutation([], { kind: 'add', productId: phoneId, quantity: 1 }))
            .toEqual([{ productId: phoneId, quantity: 1 }]);
        expect(applyCartMutation([{ productId: phoneId, quantity: 1 }],
            { kind: 'increment', productId: phoneId }))
            .toEqual([{ productId: phoneId, quantity: 2 }]);
    });

    it('decrements a line and removes it when the last unit is removed', () => {
        const lines = [{ productId: phoneId, quantity: 2 }, { productId: secondId, quantity: 1 }];
        expect(applyCartMutation(lines, { kind: 'decrement', productId: phoneId }))
            .toEqual([{ productId: phoneId, quantity: 1 }, { productId: secondId, quantity: 1 }]);
        expect(applyCartMutation(lines, { kind: 'decrement', productId: secondId }))
            .toEqual([{ productId: phoneId, quantity: 2 }]);
    });

    it('removes one line or clears the full list without writing for an absent line', () => {
        const lines = [{ productId: phoneId, quantity: 1 }];
        expect(applyCartMutation(lines, { kind: 'remove', productId: phoneId })).toEqual([]);
        expect(applyCartMutation(lines, { kind: 'clear' })).toEqual([]);
        expect(applyCartMutation([], { kind: 'clear' })).toBeNull();
        expect(applyCartMutation([], { kind: 'remove', productId: phoneId })).toBeNull();
    });

    it('rejects invalid IDs, quantities and integer overflow before a PUT', () => {
        expect(() => applyCartMutation([], { kind: 'add', productId: 'invalid', quantity: 1 }))
            .toThrow(CartValidationError);
        for (const quantity of [0, -1, 1.5, 2_147_483_648]) {
            expect(() => applyCartMutation([], { kind: 'add', productId: phoneId, quantity }))
                .toThrow(CartValidationError);
        }
        expect(() => applyCartMutation([{ productId: phoneId, quantity: 2_147_483_647 }],
            { kind: 'increment', productId: phoneId })).toThrow(CartValidationError);
    });
});
