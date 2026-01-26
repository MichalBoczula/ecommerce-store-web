import { Observable } from 'rxjs';
import { MobilePhone } from '../model/mobile-phone';
import { CreateMobilePhone } from '../model/create-mobile-phone';
import { MobilePhoneDetails } from '../model/mobile-phone-details';
import { MobilePhoneDetailsDto } from '../../../../shared/api/nswag/api-client';

export abstract class MobilePhonesRepository {
    abstract getAll(amount: number): Observable<MobilePhone[]>;
    abstract getById(id: string): Observable<MobilePhoneDetails>;
    abstract create(body: CreateMobilePhone): Observable<MobilePhoneDetailsDto>;
}
