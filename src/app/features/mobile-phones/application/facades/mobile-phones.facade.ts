import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MobilePhonesRepository } from '../../domain/ports/mobile-phones-repository.port';
import { MobilePhone } from '../../domain/model/mobile-phone';

@Injectable()
export class MobilePhonesFacade {
    private readonly repository = inject(MobilePhonesRepository);

    getAll(): Observable<MobilePhone[]> {
        return this.repository.getAll();
    }
}
