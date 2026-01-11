import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../domain/model/mobile-phone';
import { CreateMobilePhone } from '../domain/model/create-mobile-phone';

@Injectable()
export class MobilePhonesFacade {
    private readonly repository = inject(MobilePhonesRepository);

    getAll(amount: number): Observable<MobilePhone[]> {
        return this.repository.getAll(amount);
    }

    getById(id: string): Observable<MobilePhone> {
        return this.repository.getById(id);
    }

    create(body: CreateMobilePhone): Observable<MobilePhone> {
        return this.repository.create(body);
    }
}
