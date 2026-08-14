import { Guid } from '@microsoft/kiota-abstractions';
import { ShoppingCartResponse } from '../../domain/model/shopping-cart-response.model';
import { ShoppingCartLineResponse } from '../../domain/model/shopping-cart-line-response.model';
import {
    ShoppingCartResponseDto,
    ShoppingCartLineResponseDto,
    UpdateShoppingCartRequestDto,
    ShoppingCartLineRequestDto,
} from '../api-clients/orders/models';
import { UpdateShoppingCartRequest } from '../../domain/model/update-shopping-cart/update-shopping-cart-request.model';
import { ShoppingCartLineRequest } from '../../domain/model/update-shopping-cart/shopping-cart-line-request.model';

export function mapShoppingCartLineResponseDtoToShoppingCartLineResponse(
    dto: ShoppingCartLineResponseDto
): ShoppingCartLineResponse {
    return {
        productId: dto.productId?.toString() ?? '',
        name: dto.name ?? '',
        brand: dto.brand ?? null,
        unitPriceAmount: dto.unitPriceAmount ?? 0,
        unitPriceCurrency: dto.unitPriceCurrency ?? 'USD',
        quantity: dto.quantity ?? 0,
        totalAmount: dto.totalAmount ?? 0,
    };
}

export function mapShoppingCartResponseDtoToShoppingCartResponse(
    dto: ShoppingCartResponseDto
): ShoppingCartResponse {
    return {
        id: dto.id?.toString() ?? '',
        clientId: dto.clientId?.toString() ?? '',
        lines: (dto.lines ?? []).map(mapShoppingCartLineResponseDtoToShoppingCartLineResponse),
        totalAmount: dto.totalAmount ?? 0,
        totalCurrency: dto.totalCurrency ?? 'USD',
        createdAt: dto.createdAt ?? null,
        updatedAt: dto.updatedAt ?? null,
    };
}

export function mapShoppingCartLineRequestToDto(
    model: ShoppingCartLineRequest
): ShoppingCartLineRequestDto {
    return {
        productId: model.productId ? (model.productId as unknown as Guid) : null,
        name: model.name ?? null,
        brand: model.brand ?? null,
        unitPriceAmount: model.unitPriceAmount ?? 0,
        unitPriceCurrency: model.unitPriceCurrency ?? 'USD',
        quantity: model.quantity ?? 1,
    };
}

export function mapUpdateShoppingCartRequestToDto(
    request: UpdateShoppingCartRequest
): UpdateShoppingCartRequestDto {
    return {
        lines: (request.lines ?? []).map(mapShoppingCartLineRequestToDto),
    };
}