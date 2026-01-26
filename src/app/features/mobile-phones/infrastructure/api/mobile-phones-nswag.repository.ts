import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MobilePhonesRepository } from '../../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { CreateMobilePhone } from '../../domain/model/create-mobile-phone';
import { mapCreateMobilePhoneToDto, mapMobilePhoneDtoToMobilePhones, mapMobilePhoneDtoToMobilePhonesDetails } from '../mappers/mobile-phone.mapper';

import { Client, MobilePhoneDetailsDto } from '../../../../shared/api/nswag/api-client';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';

@Injectable()
export class MobilePhonesNswagRepository implements MobilePhonesRepository {
    private readonly api = inject(Client);

    getAll(amount: number): Observable<MobilePhone[]> {
        return this.api.getMobilePhones(amount).pipe(
            map(dtos => dtos.map(mapMobilePhoneDtoToMobilePhones)),
        );
    }

    getById(id: string): Observable<MobilePhoneDetails> {
        return this.api.getMobilePhoneById(id).pipe(
            map(mapMobilePhoneDtoToMobilePhonesDetails),
        );
    }

    create(body: CreateMobilePhone): Observable<MobilePhoneDetailsDto> {
        return this.api.createMobilePhone(mapCreateMobilePhoneToDto(body)).pipe(
            map(mapMobilePhoneDtoToMobilePhonesDetails),
        );
    }
}
