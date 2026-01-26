import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../domain/model/mobile-phone';
import { CreateMobilePhone } from '../domain/model/create-mobile-phone';
import { MobilePhoneDetailsDto } from '../../../shared/api/nswag/api-client';

@Injectable()
export class MobilePhonesFacade {
    private readonly repository = inject(MobilePhonesRepository);

    getAll(amount: number): Observable<MobilePhone[]> {
        return this.repository.getAll(amount);
    }

    getById(id: string): Observable<MobilePhoneDetailsDto> {
        return this.repository.getById(id);
    }

    create(body: CreateMobilePhone): Observable<MobilePhoneDetailsDto> {
        return this.repository.create(body);
    }
}
