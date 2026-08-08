import { Observable } from 'rxjs';
import { MobilePhone } from '../model/mobile-phone';
import { MobilePhoneDetails } from '../model/mobile-phone-details';
import { TopMobilePhone } from '../model/top-mobile-phone';
import { FilterMobilePhone } from '../model/filter-mobile-phones';

export abstract class MobilePhonesRepository {
    abstract getAll(amount: number): Observable<MobilePhone[]>;
    abstract getById(id: string): Observable<MobilePhoneDetails>;
    abstract getTopMobilePhones(): Observable<TopMobilePhone[]>;
    abstract getFilteredMobilePhones(filter: FilterMobilePhone): Observable<MobilePhone[]>;
}
