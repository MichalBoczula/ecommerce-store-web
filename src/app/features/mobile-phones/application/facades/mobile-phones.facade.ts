import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MobilePhonesRepository } from '../../domain/ports/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';

@Injectable()
export class MobilePhonesFacade {
    private readonly repository = inject(MobilePhonesRepository);

    getAll(amount: number): Observable<MobilePhone[]> {
        return this.repository.getAll(amount);
    }

    getById(id: string): Observable<MobilePhone> {
        return this.repository.getById(id);
    }
}
