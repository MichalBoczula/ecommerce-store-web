import { Observable } from 'rxjs';
import { Checkout } from '../model/checkout';
import { Payment } from '../model/payment';

export abstract class PaymentsRepository {
    abstract getByOrderId(orderId: string): Observable<Payment | null>;
    abstract checkout(orderId: string): Observable<Checkout>;
    abstract prepare(orderId: string): Observable<Payment>;
}
