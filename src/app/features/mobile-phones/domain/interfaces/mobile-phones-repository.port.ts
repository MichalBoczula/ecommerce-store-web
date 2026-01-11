import { Observable } from 'rxjs';
import { MobilePhone } from '../model/mobile-phone';
import { CreateMobilePhone } from '../model/create-mobile-phone';

export abstract class MobilePhonesRepository {
    abstract getAll(amount: number): Observable<MobilePhone[]>;
    abstract getById(id: string): Observable<MobilePhone>;
    abstract create(body: CreateMobilePhone): Observable<MobilePhone>;
}
