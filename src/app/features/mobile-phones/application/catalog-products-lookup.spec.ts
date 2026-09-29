import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, filter, firstValueFrom, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { CatalogProductsNotFoundError } from '../domain/model/catalog-products-not-found.error';
import { MobilePhone } from '../domain/model/mobile-phone';
import { CatalogProductsLookup } from './catalog-products-lookup';

const firstId = '11111111-1111-1111-1111-111111111111';
const missingId = '22222222-2222-2222-2222-222222222222';
const lastId = '33333333-3333-3333-3333-333333333333';

describe('catalog products lookup', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('recovers available products after a batch 404 and identifies the unavailable ID', async () => {
        const products: MobilePhone[] = [firstId, lastId].map(id => ({ id, name: id, isFavorite: false }));
        const getByIds = vi.fn((ids: string[]) => ids.includes(missingId)
            ? throwError(() => new CatalogProductsNotFoundError())
            : of(products.filter(product => ids.includes(product.id))));
        TestBed.configureTestingModule({ providers: [{ provide: MobilePhonesRepository, useValue: { getByIds } }] });

        const result = await firstValueFrom(TestBed.inject(CatalogProductsLookup).observe(
            of([firstId, missingId, lastId, firstId.toUpperCase()])
        ).pipe(filter(state => state.status === 'loaded')));

        expect(result.products.map(product => product.id)).toEqual([firstId, lastId]);
        expect(result.unavailableIds).toEqual([missingId]);
        expect(getByIds.mock.calls[0][0]).toEqual([firstId, missingId, lastId]);
        expect(getByIds).toHaveBeenCalledTimes(5);
    });

    it('keeps a server failure distinct from a missing product', async () => {
        const getByIds = vi.fn(() => throwError(() => new Error('Catalog offline')));
        TestBed.configureTestingModule({ providers: [{ provide: MobilePhonesRepository, useValue: { getByIds } }] });

        const result = await firstValueFrom(TestBed.inject(CatalogProductsLookup).observe(of([firstId])).pipe(
            filter(state => state.status === 'error')
        ));

        expect(result.error).toBe('Catalog offline');
        expect(result.unavailableIds).toEqual([]);
        expect(getByIds).toHaveBeenCalledTimes(1);
    });

    it('retries catalog failures on request without changing the requested IDs', () => {
        const getByIds = vi.fn()
            .mockReturnValueOnce(throwError(() => new Error('Catalog offline')))
            .mockReturnValueOnce(of([{ id: firstId, name: 'Recovered', isFavorite: false }]));
        TestBed.configureTestingModule({ providers: [{ provide: MobilePhonesRepository, useValue: { getByIds } }] });
        const refresh = new BehaviorSubject(0);
        const states: string[] = [];
        const subscription = TestBed.inject(CatalogProductsLookup).observe(of([firstId]), refresh)
            .subscribe(state => states.push(state.status));

        refresh.next(1);

        expect(states).toEqual(['loading', 'error', 'loading', 'loaded']);
        expect(getByIds).toHaveBeenCalledTimes(2);
        subscription.unsubscribe();
    });
});
