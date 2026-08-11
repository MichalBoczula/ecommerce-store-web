import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { environment } from '../../../../../environments/environment';

import { OrdersRepository } from '../../domain/interfaces/orders-repository.port';
import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';
import { mapShoppingCartResponseDtoToShoppingCartResponse } from '../mappers/orders.mapper';

import {
    createOrdersApiClient,
    type OrdersApiClient,
} from '../api-clients/orders/ordersApiClient';
import { ShoppingCartResponseDto } from '../api-clients/orders/models';

@Injectable()
export class OrdersKiotaRepository implements OrdersRepository {
    private readonly apiClient: OrdersApiClient;

    constructor() {
        const authProvider = new AnonymousAuthenticationProvider();
        const adapter = new FetchRequestAdapter(authProvider);

        adapter.baseUrl = environment.bffUrl;

        this.apiClient = createOrdersApiClient(adapter);
    }

    getByClientId(clientid: string): Observable<ShoppingCartResponse> {
        const requestPromise = this.apiClient.shoppingCarts.client
            .byClientId(clientid)
            .get();

        return from(requestPromise).pipe(
            map((dto: ShoppingCartResponseDto | undefined) => {
                if (!dto) {
                    throw new Error(`Shopping cart for client ${clientid} was not found.`);
                }

                return mapShoppingCartResponseDtoToShoppingCartResponse(dto);
            })
        );
    }
}