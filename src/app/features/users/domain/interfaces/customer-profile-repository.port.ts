import { Observable } from 'rxjs';
import { CustomerCompany, CustomerIndividual, CustomerProfile } from '../model/customer-profile';

export abstract class CustomerProfileRepository {
    abstract getByExternalId(externalId: string): Observable<CustomerProfile>;
    abstract updateIndividual(clientId: string, individual: CustomerIndividual): Observable<CustomerProfile>;
    abstract updateCompany(clientId: string, company: CustomerCompany): Observable<CustomerProfile>;
}
