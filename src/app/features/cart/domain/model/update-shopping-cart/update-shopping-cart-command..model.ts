import { ShoppingCartLineRequest } from './shopping-cart-line-request.model';

export interface UpdateShoppingCartCommand {
  clientId: string;
  lines: ShoppingCartLineRequest[];
}