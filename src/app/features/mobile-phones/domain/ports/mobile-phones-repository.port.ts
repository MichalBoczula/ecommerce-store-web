import { Observable } from 'rxjs';
import { MobilePhone } from '../model/mobile-phone';

export abstract class MobilePhonesRepository {
    abstract getAll(): Observable<MobilePhone[]>;
}
