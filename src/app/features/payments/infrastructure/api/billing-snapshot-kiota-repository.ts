import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { CustomerProfileRepository } from '../../../users/domain/interfaces/customer-profile-repository.port';
import { CustomerProfile } from '../../../users/domain/model/customer-profile';
import { createBffRequestAdapter } from '../../../../shared/infrastructure/bff-request-adapter';
import { createOrdersApiClient } from '../../../../shared/infrastructure/api-clients/orders/ordersApiClient';
import { ClientDataVersionResponseDto, CreateClientDataVersionRequestDto } from '../../../../shared/infrastructure/api-clients/orders/models';
import { BillingSnapshotRepository } from '../../domain/interfaces/billing-snapshot-repository.port';

export function mapBillingSnapshot(profile: CustomerProfile): CreateClientDataVersionRequestDto {
    const individual = profile.individual;
    const phone = individual.phone.replace(/[\s()-]/g, '');
    const localPhone = /^\d{9}$/.test(phone) ? phone : phone.replace(/^(?:\+48|0048|48)/, '');
    if (!/^\d{9}$/.test(localPhone)) throw new Error('Update your profile with a Polish billing phone (9 digits or +48) before Checkout.');
    return { clientName: `${individual.firstName} ${individual.lastName}`.trim(),
        ...individual.billingAddress, phoneNumber: localPhone, phonePrefix: '48', addressEmail: individual.email };
}

@Injectable()
export class BillingSnapshotKiotaRepository implements BillingSnapshotRepository {
    private readonly profiles = inject(CustomerProfileRepository);
    private readonly api = createOrdersApiClient(createBffRequestAdapter());

    ensure(clientId: string, externalId: string | null): Observable<void> {
        return this.current(clientId).pipe(switchMap(current => {
            if (!externalId) {
                if (current) return of(undefined);
                throw new Error('Select this customer by external ID in Profile before Checkout so billing details can be saved.');
            }
            return this.profiles.getByExternalId(externalId).pipe(switchMap(profile => {
                if (profile.id !== clientId) throw new Error('The billing profile does not belong to the selected order customer.');
                const request = mapBillingSnapshot(profile);
                const fields = Object.keys(request) as (keyof CreateClientDataVersionRequestDto)[];
                if (current && fields.every(field => current[field] === request[field])) return of(undefined);
                return from(this.api.clientDataVersions.byClientId(clientId).post(request)).pipe(map(saved => {
                    if (!saved?.id || saved.clientId !== clientId || !fields.every(field => saved[field] === request[field])) {
                        throw new Error('Billing snapshot was not confirmed. Refresh before starting Checkout.');
                    }
                }));
            }));
        }), catchError((error: unknown) => {
            if (typeof error === 'object' && error !== null && 'errors' in error && Array.isArray(error.errors)) {
                const messages = error.errors.flatMap((item: unknown) => typeof item === 'object' && item !== null &&
                    'message' in item && typeof item.message === 'string' ? [item.message] : []);
                if (messages.length) return throwError(() => new Error(`Invoice billing validation: ${messages.join(' ')}`));
            }
            return throwError(() => error);
        }));
    }

    private current(clientId: string): Observable<ClientDataVersionResponseDto | null> {
        return from(this.api.clientDataVersions.client.byClientId(clientId).get()).pipe(
            map(dto => {
                if (!dto?.id || dto.clientId !== clientId) throw new Error('The invoice billing snapshot is invalid.');
                return dto;
            }),
            catchError((error: unknown) => typeof error === 'object' && error !== null &&
                'responseStatusCode' in error && error.responseStatusCode === 404 ? of(null) : throwError(() => error))
        );
    }
}
