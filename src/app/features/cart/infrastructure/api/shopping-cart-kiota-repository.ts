import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { environment } from '../../../../../environments/environment';
import { ShoppingCartRepository } from '../../domain/interfaces/shopping-cart-repository.port';
import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';

@Injectable()
export class ShoppingCartKiotaRepository implements ShoppingCartRepository {

    constructor() {
        const authProvider = new AnonymousAuthenticationProvider();
        const adapter = new FetchRequestAdapter(authProvider);

        adapter.baseUrl = environment.invoicesUrl;
    }

    getByClinetId(clientid: string): Observable<ShoppingCartResponse> {
        throw new Error('Method not implemented.');
    }
}