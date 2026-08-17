import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { AnonymousAuthenticationProvider } from '@microsoft/kiota-abstractions';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';
import { environment } from '../../../../../environments/environment';
import { MobilePhonesRepository } from '../../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../../domain/model/top-mobile-phone';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';

import {
    mapFilterMobilePhoneToDto,
    mapMobilePhoneDtoToMobilePhones,
    mapMobilePhoneDtoToMobilePhonesDetails,
    mapTopMobilePhoneDtoToTopMobilePhone,
} from '../mappers/mobile-phone.mapper';

import { createProductsApiClient, type ProductsApiClient } from '../api-clients/products/productsApiClient';

@Injectable()
export class MobilePhonesKiotaRepository implements MobilePhonesRepository {
    private readonly api: ProductsApiClient;

    constructor() {
        const authProvider = new AnonymousAuthenticationProvider();
        const adapter = new FetchRequestAdapter(authProvider);

        adapter.baseUrl = environment.bffUrl;

        this.api = createProductsApiClient(adapter);
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