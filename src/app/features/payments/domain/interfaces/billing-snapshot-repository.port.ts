import { Observable } from 'rxjs';

export abstract class BillingSnapshotRepository {
    abstract ensure(clientId: string, externalId: string | null): Observable<void>;
}
