import { Observable } from 'rxjs';
import { ShoppingCartResponse } from '../model/shopping-cart-response.model';

export abstract class OrdersRepository {
    abstract getByClientId(clientid: string): Observable<ShoppingCartResponse>;
}
