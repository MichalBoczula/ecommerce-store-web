import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { createOrdersApiClient } from '../../../../shared/infrastructure/api-clients/orders/ordersApiClient';
import { OrderHistoryRepository } from '../../domain/interfaces/order-history-repository.port';
import { Order } from '../../domain/model/order';
import { OrderNotFoundError } from '../../domain/model/order-not-found.error';
import { mapOrderResponse } from '../mappers/order.mapper';

@Injectable()
export class OrderHistoryKiotaRepository implements OrderHistoryRepository {
    private readonly api = createOrdersApiClient(createBffRequestAdapter());

    getByClientId(clientId: string): Observable<Order[]> {
        return from(this.api.orders.client.byClientId(clientId).get()).pipe(
            map(dtos => (dtos ?? []).map(mapOrderResponse))
        );
    }

    getById(orderId: string): Observable<Order> {
        return from(this.api.orders.byOrderId(orderId).get()).pipe(
            map(dto => {
                if (!dto) throw new OrderNotFoundError();
                return mapOrderResponse(dto);
            }),
            catchError((error: unknown) => {
                if (typeof error === 'object' && error !== null &&
                    'responseStatusCode' in error && error.responseStatusCode === 404) {
                    return throwError(() => new OrderNotFoundError());
                }
                return throwError(() => error);
            })
        );
    }

    createForClient(clientId: string): Observable<Order> {
        return from(this.api.orders.client.byClientId(clientId).post()).pipe(
            map(dto => {
                if (!dto) throw new Error('The order response was empty. Check order history before trying again.');
                return mapOrderResponse(dto);
            })
        );
    }
}
