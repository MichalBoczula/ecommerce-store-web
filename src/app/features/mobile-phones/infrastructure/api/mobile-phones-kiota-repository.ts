import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { MobilePhonesRepository } from '../../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../../domain/model/top-mobile-phone';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';
import { CatalogProductsNotFoundError } from '../../domain/model/catalog-products-not-found.error';

import {
    mapFilterMobilePhoneToDto,
    mapMobilePhoneDtoToMobilePhones,
    mapMobilePhoneDtoToMobilePhonesDetails,
    mapTopMobilePhoneDtoToTopMobilePhone,
} from '../mappers/mobile-phone.mapper';

import { createProductsApiClient, type ProductsApiClient } from '../../../../shared/infrastructure/api-clients/products/productsApiClient';
import { createMobilePhoneDtoFromDiscriminatorValue } from '../../../../shared/infrastructure/api-clients/products/models';
import { ByIdsRequestBuilderRequestsMetadata } from '../../../../shared/infrastructure/api-clients/products/mobilePhones/byIds';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';

@Injectable()
export class MobilePhonesKiotaRepository implements MobilePhonesRepository {
    private readonly api: ProductsApiClient;
    private readonly adapter: FetchRequestAdapter;

    constructor() {
        this.adapter = createBffRequestAdapter();
        this.api = createProductsApiClient(this.adapter);
    }

    getAll(amount: number): Observable<MobilePhone[]> {
        const promise = this.api.mobilePhones.get({
            queryParameters: {
                amount: amount
            }
        });

        return from(promise).pipe(
            map(dtos => (dtos ?? []).map(dto => mapMobilePhoneDtoToMobilePhones(dto)))
        );
    }

    getById(id: string): Observable<MobilePhoneDetails> {
        const promise = this.api.mobilePhones.byId(id).get();

        return from(promise).pipe(
            map(dto => {
                if (!dto) {
                    throw new Error(`Mobile phone with id ${id} not found.`);
                }
                return mapMobilePhoneDtoToMobilePhonesDetails(dto);
            })
        );
    }

    getByIds(ids: string[]): Observable<MobilePhone[]> {
        const request = this.api.mobilePhones.byIds.toPostRequestInformation(ids);
        // Kiota's generated scalar-array POST metadata omits the body at runtime.
        // Keep generated code intact and serialize the GUID array in this adapter.
        request.setContentFromScalar(this.adapter, 'application/json', ids);
        return from(this.adapter.sendCollection(
            request,
            createMobilePhoneDtoFromDiscriminatorValue,
            ByIdsRequestBuilderRequestsMetadata.post?.errorMappings
        )).pipe(
            map(dtos => (dtos ?? []).map(dto => mapMobilePhoneDtoToMobilePhones(dto))),
            catchError((error: unknown) => {
                if (typeof error === 'object' && error !== null &&
                    'responseStatusCode' in error && error.responseStatusCode === 404) {
                    return throwError(() => new CatalogProductsNotFoundError());
                }
                return throwError(() => error);
            })
        );
    }

    getTopMobilePhones(): Observable<TopMobilePhone[]> {
        const promise = this.api.mobilePhones.top.get();

        return from(promise).pipe(
            map(dtos => (dtos ?? []).map(mapTopMobilePhoneDtoToTopMobilePhone))
        );
    }

    getFilteredMobilePhones(filter: FilterMobilePhone): Observable<MobilePhone[]> {
        const filterDto = mapFilterMobilePhoneToDto(filter);
        const promise = this.api.mobilePhones.filter.post(filterDto);

        return from(promise).pipe(
            map(dtos => (dtos ?? []).map(dto => mapMobilePhoneDtoToMobilePhones(dto)))
        );
    }
}
