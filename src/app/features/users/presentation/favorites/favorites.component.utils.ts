import { Favorite } from '../../domain/model/favorite-response.model';
import { MobilePhone } from '../../../mobile-phones/domain/model/mobile-phone';
import { ShoppingCartLineRequest } from '../../../cart/domain/model/update-shopping-cart/shopping-cart-line-request.model';
import { FavoriteItemViewModel } from '../../domain/model/favorite-item.model';

export function toFavoriteItemViewModels(
    favorites: Favorite[] | null | undefined,
    products: MobilePhone[] | null | undefined
): FavoriteItemViewModel[] {
    const favList = favorites ?? [];
    const productList = products ?? [];

    const productMap = new Map<string, MobilePhone>(
        productList.filter(p => !!p.id).map(p => [p.id.toLowerCase(), p])
    );

    return favList.map(fav => {
        const product = productMap.get(fav.productId.toLowerCase());
        return {
            productId: fav.productId,
            name: product?.name || (product ? 'Unnamed product' : 'Product unavailable'),
            brand: product?.brand ?? null,
            priceAmount: product?.price?.amount ?? null,
            priceCurrency: product?.price?.currency || null,
            unavailable: !product,
            addedAt: fav.addedAt,
        };
    });
}

export function toCartLineItem(
    item: FavoriteItemViewModel,
    quantity = 1
): ShoppingCartLineRequest {
    return {
        productId: item.productId,
        quantity,
    };
}
