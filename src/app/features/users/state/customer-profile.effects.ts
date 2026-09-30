import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, exhaustMap } from 'rxjs';
import { CustomerProfileRepository } from '../domain/interfaces/customer-profile-repository.port';
import { ProfileConflictError, ProfileNotFoundError } from '../infrastructure/api/customer-profile-kiota-repository';
import { CustomerProfileActions } from './customer-profile.actions';

function message(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'detail' in error &&
        typeof error.detail === 'string' && error.detail) return error.detail;
    return error instanceof Error ? error.message : 'The profile request failed.';
}

@Injectable()
export class CustomerProfileEffects {
    private readonly actions$ = inject(Actions);
    private readonly repository = inject(CustomerProfileRepository);

    load$ = createEffect(() => this.actions$.pipe(
        ofType(CustomerProfileActions.load),
        switchMap(({ externalId }) => this.repository.getByExternalId(externalId).pipe(
            map(profile => CustomerProfileActions.loadSuccess({ profile })),
            catchError((error: unknown) => of(CustomerProfileActions.loadFailure({
                error: message(error), notFound: error instanceof ProfileNotFoundError,
            })))
        ))
    ));

    save$ = createEffect(() => this.actions$.pipe(
        ofType(CustomerProfileActions.save, CustomerProfileActions.saveCompany),
        exhaustMap(action => (action.type === CustomerProfileActions.save.type
            ? this.repository.updateIndividual(action.clientId, action.individual)
            : this.repository.updateCompany(action.clientId, action.company)).pipe(
            map(profile => CustomerProfileActions.saveSuccess({ profile })),
            catchError((error: unknown) => of(CustomerProfileActions.saveFailure({
                error: message(error), conflict: error instanceof ProfileConflictError,
                notFound: error instanceof ProfileNotFoundError,
            })))
        ))
    ));
}
