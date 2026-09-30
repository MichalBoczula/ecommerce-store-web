import { Observable } from 'rxjs';
import { Payment } from '../model/payment';

export abstract class PaymentsRepository {
    abstract getByOrderId(orderId: string): Observable<Payment | null>;
    abstract prepare(orderId: string): Observable<Payment>;
}
