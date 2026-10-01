import { PaymentResponse } from '../../../../shared/infrastructure/api-clients/payments/models';
import { Payment } from '../../domain/model/payment';

export function mapPaymentResponse(dto: PaymentResponse, orderId: string): Payment {
    if (!dto.id || dto.orderId !== orderId || !dto.status ||
        dto.amountMinor == null || !Number.isSafeInteger(dto.amountMinor) || dto.amountMinor <= 0 || !dto.currency) {
        throw new Error('The payment response is incomplete or belongs to another order.');
    }
    return {
        id: dto.id,
        orderId: dto.orderId,
        status: dto.status,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
    };
}
