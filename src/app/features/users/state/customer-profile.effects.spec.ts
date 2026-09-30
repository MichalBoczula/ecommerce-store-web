import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerProfileRepository } from '../domain/interfaces/customer-profile-repository.port';
import { ProfileConflictError, ProfileNotFoundError } from '../infrastructure/api/customer-profile-kiota-repository';
import { mapCustomerProfile } from '../infrastructure/mappers/customer-profile.mapper';
import { profileDto } from '../infrastructure/mappers/customer-profile.fixture';
import { CustomerProfileActions } from './customer-profile.actions';
import { CustomerProfileEffects } from './customer-profile.effects';

const profile = mapCustomerProfile(profileDto);

describe('customer profile effects', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads a real profile and distinguishes an unknown external ID', () => {
        const actions = new Subject<Action>();
        const repository = { getByExternalId: vi.fn()
            .mockReturnValueOnce(of(profile))
            .mockReturnValueOnce(throwError(() => new ProfileNotFoundError())),
            updateIndividual: vi.fn() };
        TestBed.configureTestingModule({ providers: [
            CustomerProfileEffects, { provide: Actions, useValue: new Actions(actions) },
            { provide: CustomerProfileRepository, useValue: repository },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(CustomerProfileEffects).load$.subscribe(action => results.push(action));
        actions.next(CustomerProfileActions.load({ externalId: profile.externalId }));
        actions.next(CustomerProfileActions.load({ externalId: 'missing' }));
        expect(results).toEqual([
            CustomerProfileActions.loadSuccess({ profile }),
            CustomerProfileActions.loadFailure({ error: new ProfileNotFoundError().message, notFound: true }),
        ]);
        subscription.unsubscribe();
    });

    it('reports an optimistic update conflict without a false saved state', () => {
        const actions = new Subject<Action>();
        const repository = { getByExternalId: vi.fn(),
            updateIndividual: vi.fn(() => throwError(() => new ProfileConflictError())) };
        TestBed.configureTestingModule({ providers: [
            CustomerProfileEffects, { provide: Actions, useValue: new Actions(actions) },
            { provide: CustomerProfileRepository, useValue: repository },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(CustomerProfileEffects).save$.subscribe(action => results.push(action));
        actions.next(CustomerProfileActions.save({ clientId: profile.id, individual: profile.individual }));
        expect(repository.updateIndividual).toHaveBeenCalledExactlyOnceWith(profile.id, profile.individual);
        expect(results).toEqual([CustomerProfileActions.saveFailure({
            error: new ProfileConflictError().message, conflict: true, notFound: false,
        })]);
        subscription.unsubscribe();
    });

    it('saves company billing data through the company repository operation', () => {
        const actions = new Subject<Action>();
        const repository = { getByExternalId: vi.fn(), updateIndividual: vi.fn(),
            updateCompany: vi.fn(() => of(profile)) };
        TestBed.configureTestingModule({ providers: [
            CustomerProfileEffects, { provide: Actions, useValue: new Actions(actions) },
            { provide: CustomerProfileRepository, useValue: repository },
        ] });
        const results: Action[] = [];
        const subscription = TestBed.inject(CustomerProfileEffects).save$.subscribe(action => results.push(action));
        actions.next(CustomerProfileActions.saveCompany({ clientId: profile.id, company: profile.companies[0] }));
        expect(repository.updateIndividual).not.toHaveBeenCalled();
        expect(repository.updateCompany).toHaveBeenCalledExactlyOnceWith(profile.id, profile.companies[0]);
        expect(results).toEqual([CustomerProfileActions.saveSuccess({ profile })]);
        subscription.unsubscribe();
    });
});
