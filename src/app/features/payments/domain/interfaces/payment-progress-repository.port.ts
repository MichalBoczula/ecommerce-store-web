import { Observable } from 'rxjs';
import { PaymentProgress } from '../model/checkout';

export abstract class PaymentProgressRepository {
    abstract get(clientId: string, orderId: string): Observable<PaymentProgress>;
}
