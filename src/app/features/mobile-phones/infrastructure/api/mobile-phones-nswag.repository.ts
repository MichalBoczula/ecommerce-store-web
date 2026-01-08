import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { MobilePhonesRepository } from '../../domain/ports/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { mapMobilePhoneDtoToDomain } from '../mappers/mobile-phone.mapper';

import { Client } from '../../../../shared/api/nswag/api-client';

@Injectable()
export class MobilePhonesNswagRepository implements MobilePhonesRepository {
    private readonly api = inject(Client);

    getAll(amount: number): Observable<MobilePhone[]> {
        return this.api.getMobilePhones(amount).pipe(
            map(dtos => dtos.map(mapMobilePhoneDtoToDomain)),
        );
    }
}
