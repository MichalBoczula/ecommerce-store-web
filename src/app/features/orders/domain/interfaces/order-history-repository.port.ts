import { Observable } from 'rxjs';
import { Order } from '../model/order';

export abstract class OrderHistoryRepository {
    abstract getByClientId(clientId: string): Observable<Order[]>;
    abstract getById(orderId: string): Observable<Order>;
    abstract createForClient(clientId: string): Observable<Order>;
}
