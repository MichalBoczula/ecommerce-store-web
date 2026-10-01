import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, throwError } from 'rxjs';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { createPaymentsApiClient } from '../../../../shared/infrastructure/api-clients/payments/paymentsApiClient';
import { PaymentsRepository } from '../../domain/interfaces/payments-repository.port';
import { Checkout } from '../../domain/model/checkout';
import { validateCheckoutUrl } from '../../application/checkout-browser';
import { Payment } from '../../domain/model/payment';
import { mapPaymentResponse } from '../mappers/payment.mapper';

@Injectable()
export class PaymentsKiotaRepository implements PaymentsRepository {
    private readonly api = createPaymentsApiClient(createBffRequestAdapter());

    getByOrderId(orderId: string): Observable<Payment | null> {
        return from(this.api.payments.order.byOrder_id(orderId).get()).pipe(
            map(dto => dto ? mapPaymentResponse(dto, orderId) : null),
            catchError((error: unknown) => {
                if (typeof error === 'object' && error !== null &&
                    'responseStatusCode' in error && error.responseStatusCode === 404) {
                    return of(null);
                }
                return throwError(() => error);
            })
        );
    }

    checkout(orderId: string): Observable<Checkout> {
        return from(this.api.payments.byOrder_id(orderId).checkout.post()).pipe(map(dto => {
            if (!dto?.payment || !dto.checkoutStatus) throw new Error('The Checkout response was incomplete. Refresh payment status.');
            const payment = mapPaymentResponse(dto.payment, orderId);
            const url = dto.checkoutUrl ? validateCheckoutUrl(dto.checkoutUrl) : null;
            if (dto.checkoutStatus === 'open' && !url) throw new Error('Open Checkout has no hosted URL.');
            if (dto.checkoutStatus !== 'open' && url) throw new Error('Closed Checkout returned a hosted URL.');
            return { payment, url, status: dto.checkoutStatus };
        }));
    }

    prepare(orderId: string): Observable<Payment> {
        return from(this.api.payments.byOrder_id(orderId).pay.post()).pipe(
            map(dto => {
                if (!dto) throw new Error('The payment response was empty. Check its status before trying again.');
                return mapPaymentResponse(dto, orderId);
            })
        );
    }
}
