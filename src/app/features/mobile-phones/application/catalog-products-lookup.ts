import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, distinctUntilChanged, forkJoin, map, Observable, of, startWith, switchMap, throwError } from 'rxjs';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { CatalogProductsNotFoundError } from '../domain/model/catalog-products-not-found.error';
import { MobilePhone } from '../domain/model/mobile-phone';

export interface CatalogProductsResult {
    products: MobilePhone[];
    unavailableIds: string[];
}

export interface CatalogProductsState extends CatalogProductsResult {
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
}

function uniqueIds(ids: readonly string[]): string[] {
    return [...new Map(ids.map(id => [id.toLowerCase(), id])).values()];
}

@Injectable({ providedIn: 'root' })
export class CatalogProductsLookup {
    private readonly repository = inject(MobilePhonesRepository);

    observe(ids$: Observable<readonly string[]>, refresh$: Observable<unknown> = of(0)): Observable<CatalogProductsState> {
        const distinctIds$ = ids$.pipe(
            map(uniqueIds),
            distinctUntilChanged((left, right) =>
                left.length === right.length && left.every((id, index) => id.toLowerCase() === right[index].toLowerCase()))
        );
        return combineLatest([distinctIds$, refresh$]).pipe(
            switchMap(([ids]) => {
                if (ids.length === 0) {
                    return of({ products: [], unavailableIds: [], status: 'loaded' as const, error: null });
                }

                return this.resolve(ids).pipe(
                    map(result => ({ ...result, status: 'loaded' as const, error: null })),
                    startWith({ products: [], unavailableIds: [], status: 'loading' as const, error: null }),
                    catchError((error: unknown) => of({
                        products: [],
                        unavailableIds: [],
                        status: 'error' as const,
                        error: error instanceof Error ? error.message : 'The catalog request failed.',
                    }))
                );
            })
        );
    }

    // The API rejects the whole batch if any requested product is missing or inactive.
    // Split only those failed batches to retain the available products.
    private resolve(ids: string[]): Observable<CatalogProductsResult> {
        return this.repository.getByIds(ids).pipe(
            map(products => {
                const found = new Set(products.map(product => product.id.toLowerCase()));
                return {
                    products,
                    unavailableIds: ids.filter(id => !found.has(id.toLowerCase())),
                };
            }),
            catchError((error: unknown) => {
                if (!(error instanceof CatalogProductsNotFoundError)) {
                    return throwError(() => error);
                }
                if (ids.length === 1) {
                    return of({ products: [], unavailableIds: ids });
                }
                const middle = Math.floor(ids.length / 2);
                return forkJoin([this.resolve(ids.slice(0, middle)), this.resolve(ids.slice(middle))]).pipe(
                    map(([left, right]) => ({
                        products: [...left.products, ...right.products],
                        unavailableIds: [...left.unavailableIds, ...right.unavailableIds],
                    }))
                );
            })
        );
    }
}
