import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { createUsersApiClient } from '../../../../shared/infrastructure/api-clients/users/usersApiClient';
import { CustomerProfileRepository } from '../../domain/interfaces/customer-profile-repository.port';
import { CustomerCompany, CustomerIndividual, CustomerProfile } from '../../domain/model/customer-profile';
import { mapCustomerProfile, mapCompanyRequest, mapIndividualRequest } from '../mappers/customer-profile.mapper';

export class ProfileNotFoundError extends Error {
    constructor() { super('Customer profile was not found. Check the external ID.'); }
}
export class ProfileConflictError extends Error {
    constructor() { super('The profile changed while you were editing. Reload it before saving again.'); }
}

@Injectable()
export class CustomerProfileKiotaRepository implements CustomerProfileRepository {
    private readonly api = createUsersApiClient(createBffRequestAdapter());

    getByExternalId(externalId: string): Observable<CustomerProfile> {
        return from(this.api.customers.external.byExternalId(externalId).get()).pipe(
            map(dto => {
                if (!dto) throw new ProfileNotFoundError();
                return mapCustomerProfile(dto);
            }),
            catchError(error => throwError(() => this.mapError(error)))
        );
    }

    updateIndividual(clientId: string, individual: CustomerIndividual): Observable<CustomerProfile> {
        return from(this.api.customers.byCustomerId(clientId).individual.put(mapIndividualRequest(individual))).pipe(
            map(dto => {
                if (!dto) throw new Error('The profile update returned no data.');
                return mapCustomerProfile(dto);
            }),
            catchError(error => throwError(() => this.mapError(error)))
        );
    }

    updateCompany(clientId: string, company: CustomerCompany): Observable<CustomerProfile> {
        return from(this.api.customers.byCustomerId(clientId).companies.byCompanyId(company.id)
            .put(mapCompanyRequest(company))).pipe(
            map(dto => {
                if (!dto) throw new Error('The company update returned no data.');
                return mapCustomerProfile(dto);
            }),
            catchError(error => throwError(() => this.mapError(error)))
        );
    }

    private mapError(error: unknown): Error {
        if (typeof error === 'object' && error !== null && 'responseStatusCode' in error) {
            if (error.responseStatusCode === 404) return new ProfileNotFoundError();
            if (error.responseStatusCode === 409) return new ProfileConflictError();
        }
        return error instanceof Error ? error : new Error('The profile request failed.');
    }
}
