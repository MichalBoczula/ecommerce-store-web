import { Observable } from 'rxjs';
import { ShoppingCartResponse } from '../model/shopping-cart-response.model';
import { UpdateShoppingCartRequest } from '../model/update-shopping-cart/update-shopping-cart-request.model';

export abstract class OrdersRepository {
    abstract getByClientId(clientId: string): Observable<ShoppingCartResponse>;
    abstract updateCart(clientId: string, request: UpdateShoppingCartRequest): Observable<ShoppingCartResponse>;
}