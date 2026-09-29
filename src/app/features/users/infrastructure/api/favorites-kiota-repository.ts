import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';

import { FavoritesRepository } from '../../domain/interfaces/favorites-repository.port';
import { Favorite } from '../../domain/model/favorite-response.model';
import { AddFavoriteCommand } from '../../domain/model/add-favorite-command.model';
import { FavoriteMapper } from '../mappers/favorite.mapper';

import {
    createUsersApiClient,
    type UsersApiClient,
} from '../../../../shared/infrastructure/api-clients/users/usersApiClient';
import { FavoriteResponseDto } from '../../../../shared/infrastructure/api-clients/users/models';

@Injectable()
export class FavoritesKiotaRepository implements FavoritesRepository {
    private readonly apiClient: UsersApiClient;

    constructor() {
        this.apiClient = createUsersApiClient(createBffRequestAdapter());
    }

    addFavorite(command: AddFavoriteCommand): Observable<Favorite> {
        const requestBody = FavoriteMapper.toAddRequestDto(command.productId);

        const requestPromise = this.apiClient.favorites.clients
            .byClientId(command.clientId)
            .post(requestBody);

        return from(requestPromise).pipe(
            map((dto: FavoriteResponseDto | undefined) => {
                if (!dto) {
                    throw new Error(`Failed to add favorite product ${command.productId} for client ${command.clientId}.`);
                }

                return FavoriteMapper.toDomain(dto);
            })
        );
    }

    getFavorites(clientId: string): Observable<Favorite[]> {
        const requestPromise = this.apiClient.favorites.clients
            .byClientId(clientId)
            .get();

        return from(requestPromise).pipe(
            map((dtos: FavoriteResponseDto[] | undefined) => {
                if (!dtos) {
                    return [];
                }

                return dtos.map((dto) => FavoriteMapper.toDomain(dto));
            })
        );
    }

    removeFavorite(clientId: string, productId: string): Observable<void> {
        const promise = this.apiClient.favorites
            .clients
            .byClientId(clientId)
            .products
            .byProductId(productId)
            .delete();

        return from(promise);
    }

    clearAllFavorites(clientId: string): Observable<void> {
        const promise = this.apiClient.favorites
            .clients
            .byClientId(clientId)
            .delete();

        return from(promise);
    }
}
