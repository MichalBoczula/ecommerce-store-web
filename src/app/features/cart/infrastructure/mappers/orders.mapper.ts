import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';
import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';
import {
    ShoppingCartResponseDto,
    ShoppingCartLineResponseDto,
} from '../api-clients/orders/models';

export function mapShoppingCartResponseDtoToShoppingCartResponse(
    dto: ShoppingCartResponseDto
): ShoppingCartResponse {
    return dto as ShoppingCartResponse;
}

export function mapShoppingCartLineResponseDtoToShoppingCartLineResponse(
    dto: ShoppingCartLineResponseDto
): ShoppingCartLineResponse {
    return dto as ShoppingCartLineResponse;
}