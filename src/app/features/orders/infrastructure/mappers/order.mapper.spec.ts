import { describe, expect, it } from 'vitest';
import { OrderResponseDto } from '../../../../shared/infrastructure/api-clients/orders/models';
import { mapOrderResponse } from './order.mapper';

const orderId = '11111111-1111-1111-1111-111111111111';
const clientId = '22222222-2222-2222-2222-222222222222';
const productId = '33333333-3333-3333-3333-333333333333';
const versionId = '44444444-4444-4444-4444-444444444444';

export const orderDto: OrderResponseDto = {
    id: orderId,
    clientId,
    createdAt: new Date('2026-08-01T12:00:00Z'),
    updatedAt: null,
    status: 'Pending',
    totalAmount: 190,
    totalCurrency: 'EUR',
    lines: [{
        productVersionId: versionId,
        quantity: 2,
        lineTotalAmount: 190,
        productVersion: {
            id: versionId,
            productId,
            name: 'Saved phone name',
            brand: 'Saved brand',
            priceAmount: 95,
            priceCurrency: 'EUR',
        },
    }],
};

describe('order snapshot mapper', () => {
    it('uses the stored product version and server totals', () => {
        const order = mapOrderResponse(orderDto);

        expect(order.lines[0]).toEqual({
            productVersionId: versionId,
            quantity: 2,
            lineTotalAmount: 190,
            productVersion: {
                id: versionId, productId, name: 'Saved phone name', brand: 'Saved brand',
                priceAmount: 95, priceCurrency: 'EUR',
            },
        });
        expect(order.totalAmount).toBe(190);
        expect(order.createdAt).toEqual(new Date('2026-08-01T12:00:00Z'));
    });

    it('rejects incomplete snapshots instead of inventing names or zero prices', () => {
        expect(() => mapOrderResponse({ ...orderDto, lines: [
            { ...orderDto.lines![0], productVersion: null },
        ] })).toThrow('productVersion is missing');
        expect(() => mapOrderResponse({ ...orderDto, totalAmount: null })).toThrow('totalAmount');
    });
});
