import { ShoppingCartLineRequest } from './shopping-cart-line-request.model';

export interface UpdateShoppingCartRequest {
    lines: ShoppingCartLineRequest[];
}