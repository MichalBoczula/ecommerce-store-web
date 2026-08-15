import { FavoriteResponseDto, AddFavoriteRequestDto } from '../api-clients/models/index';
import { Favorite } from '../../domain/model/favorite-response.model';

export class FavoriteMapper {
    static toAddRequestDto(productId: string): AddFavoriteRequestDto {
        return {
            productId: productId,
        };
    }

    static toDomain(dto: FavoriteResponseDto | undefined | null): Favorite {
        if (!dto) {
            throw new Error('FavoriteResponseDto cannot be null or undefined');
        }

        return {
            id: dto.id?.toString() ?? '',
            clientId: dto.clientId?.toString() ?? '',
            productId: dto.productId?.toString() ?? '',
            addedAt: dto.addedAt ?? new Date(),
        };
    }
}