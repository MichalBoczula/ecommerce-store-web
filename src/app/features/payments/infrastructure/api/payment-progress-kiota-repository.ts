import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { OrderHistoryRepository } from '../../../orders/domain/interfaces/order-history-repository.port';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { createOrdersApiClient } from '../../../../shared/infrastructure/api-clients/orders/ordersApiClient';
import { PaymentProgressRepository } from '../../domain/interfaces/payment-progress-repository.port';
import { PaymentsRepository } from '../../domain/interfaces/payments-repository.port';
import { CompletedInvoice, PaymentProgress } from '../../domain/model/checkout';

@Injectable()
export class PaymentProgressKiotaRepository implements PaymentProgressRepository {
    private readonly orders = inject(OrderHistoryRepository);
    private readonly payments = inject(PaymentsRepository);
    private readonly api = createOrdersApiClient(createBffRequestAdapter());

    get(clientId: string, orderId: string): Observable<PaymentProgress> {
        return this.orders.getById(orderId).pipe(switchMap(order => {
            if (order.id !== orderId || order.clientId !== clientId) throw new Error('This order does not belong to the selected demo customer.');
            return forkJoin({ payment: this.payments.getByOrderId(orderId), invoice: this.invoice(orderId) })
                .pipe(map(({ payment, invoice }) => ({ order, payment, invoice })));
        }));
    }

    private invoice(orderId: string): Observable<CompletedInvoice | null> {
        return from(this.api.invoices.byOrder.byOrderId(orderId).get()).pipe(
            map(dto => {
                if (!dto?.id || dto.orderId !== orderId || !dto.createdAt || !Number.isFinite(dto.createdAt.getTime())) {
                    throw new Error('The completed invoice response was incomplete or belonged to another order.');
                }
                // Storage locations belong to a future download adapter (DEP/7), never presentation links.
                return { id: dto.id, orderId: dto.orderId, createdAt: dto.createdAt };
            }),
            catchError((error: unknown) => typeof error === 'object' && error !== null &&
                'responseStatusCode' in error && error.responseStatusCode === 404 ? of(null) : throwError(() => error))
        );
    }
}
