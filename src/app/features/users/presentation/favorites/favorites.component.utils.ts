import { Favorite } from '../../domain/model/favorite-response.model';
import { MobilePhoneDto } from '../../../mobile-phones/infrastructure/api-clients/products/models';
import { ShoppingCartLineRequest } from '../../../cart/domain/model/update-shopping-cart/shopping-cart-line-request.model';
import { FavoriteItemViewModel } from '../../domain/model/favorite-item.model';

export function toFavoriteItemViewModels(
    favorites: Favorite[] | null | undefined,
    products: MobilePhoneDto[] | null | undefined
): FavoriteItemViewModel[] {
    const favList = favorites ?? [];
    const productList = products ?? [];

    const productMap = new Map<string, MobilePhoneDto>(
        productList.filter(p => !!p.id).map(p => [p.id!, p])
    );

    return favList.map(fav => {
        const product = productMap.get(fav.productId);
        return {
            productId: fav.productId,
            name: product?.name ?? 'Unknown Product',
            brand: product?.brand ?? null,
            priceAmount: product?.price?.amount ?? 0,
            priceCurrency: product?.price?.currency ?? 'USD',
            addedAt: fav.addedAt,
        };
    });
}

export function toCartLineItem(
    item: FavoriteItemViewModel,
    quantity: number = 1
): ShoppingCartLineRequest {
    return {
        productId: item.productId,
        name: item.name,
        brand: item.brand ?? null,
        unitPriceAmount: item.priceAmount,
        unitPriceCurrency: item.priceCurrency,
        quantity,
    };
}