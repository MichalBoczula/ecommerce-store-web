import { Observable } from 'rxjs';
import { MobilePhone } from '../model/mobile-phone';

export abstract class MobilePhonesRepository {
    abstract getAll(amount: number): Observable<MobilePhone[]>;
    abstract getById(id: string): Observable<MobilePhone>;
}
