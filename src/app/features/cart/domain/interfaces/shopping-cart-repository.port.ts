import { Observable } from 'rxjs';
import { ShoppingCartResponse } from '../model/shopping-cart-response.model';

export abstract class ShoppingCartRepository {
    abstract getByClinetId(clientid: string): Observable<ShoppingCartResponse>;
}
