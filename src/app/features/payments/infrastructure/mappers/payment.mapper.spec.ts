import { describe, expect, it } from 'vitest';
import { PaymentResponse } from '../../../../shared/infrastructure/api-clients/payments/models';
import { mapPaymentResponse } from './payment.mapper';

const orderId = '11111111-1111-1111-1111-111111111111';
const dto: PaymentResponse = {
    id: '22222222-2222-2222-2222-222222222222', orderId,
    status: 'created', amountMinor: 19000, currency: 'EUR',
};

describe('payment response mapping', () => {
    it('preserves the upstream status and minor amount', () => {
        expect(mapPaymentResponse(dto, orderId)).toEqual({
            id: dto.id, orderId, status: 'created', amountMinor: 19000, currency: 'EUR',
        });
    });

    it('rejects a payment for a different order or missing amount', () => {
        expect(() => mapPaymentResponse({ ...dto, orderId: 'other' }, orderId)).toThrow('another order');
        expect(() => mapPaymentResponse({ ...dto, amountMinor: null }, orderId)).toThrow('incomplete');
    });
});
