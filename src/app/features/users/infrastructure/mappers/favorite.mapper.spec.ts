import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FavoriteMapper } from './favorite.mapper';
import { FavoriteResponseDto } from '../api-clients/models';

describe('FavoriteMapper', () => {
    describe('toAddRequestDto', () => {
        it('should map productId into AddFavoriteRequestDto', () => {
            const productId = 'phone-123';

            const result = FavoriteMapper.toAddRequestDto(productId);

            expect(result).toEqual({
                productId: 'phone-123',
            });
        });
    });

    describe('toDomain', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should throw an error when dto is null or undefined', () => {
            expect(() => FavoriteMapper.toDomain(null)).toThrowError(
                'FavoriteResponseDto cannot be null or undefined'
            );
            expect(() => FavoriteMapper.toDomain(undefined)).toThrowError(
                'FavoriteResponseDto cannot be null or undefined'
            );
        });

        it('should map all valid DTO fields to domain Favorite entity', () => {
            const fixedDate = new Date('2026-01-15T10:00:00.000Z');
            const dto: FavoriteResponseDto = {
                id: 'fav-1' as any,
                clientId: 'client-99' as any,
                productId: 'prod-456' as any,
                addedAt: fixedDate,
            };

            const result = FavoriteMapper.toDomain(dto);

            expect(result).toEqual({
                id: 'fav-1',
                clientId: 'client-99',
                productId: 'prod-456',
                addedAt: fixedDate,
            });
        });

        it('should supply fallback defaults when optional DTO fields are missing', () => {
            const mockNow = new Date('2026-03-01T12:00:00.000Z');
            vi.setSystemTime(mockNow);

            const incompleteDto: FavoriteResponseDto = {
                id: undefined,
                clientId: undefined,
                productId: undefined,
                addedAt: undefined,
            };

            const result = FavoriteMapper.toDomain(incompleteDto);

            expect(result).toEqual({
                id: '',
                clientId: '',
                productId: '',
                addedAt: mockNow,
            });
        });
    });
});