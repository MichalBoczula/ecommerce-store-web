import type { MockedObject } from "vitest";
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { MobilePhonesEffects } from './mobile-phones-effects';
import * as Actions from './mobile-phones.actions';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../domain/model/mobile-phone';
import { FilterMobilePhone } from '../domain/model/filter-mobile-phones';
import { MobilePhoneFilterDto } from '../../../shared/api/nswag/api-client';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';

describe('MobilePhonesEffects', () => {
    let actions$: ReplaySubject<any>;
    let effects: MobilePhonesEffects;
    let repo: MockedObject<MobilePhonesRepository>;

    beforeEach(() => {
        repo = {
            getAll: vi.fn().mockName("MobilePhonesRepository.getAll"),
            getById: vi.fn().mockName("MobilePhonesRepository.getById"),
            create: vi.fn().mockName("MobilePhonesRepository.create"),
            getTopMobilePhones: vi.fn().mockName("MobilePhonesRepository.getTopMobilePhones"),
            getFilteredMobilePhones: vi.fn().mockName("MobilePhonesRepository.getFilteredMobilePhones")
        };

        TestBed.configureTestingModule({
            providers: [
                MobilePhonesEffects,
                provideMockActions(() => actions$ as Observable<any>),
                { provide: MobilePhonesRepository, useValue: repo },
            ],
        });

        effects = TestBed.inject(MobilePhonesEffects);
        actions$ = new ReplaySubject(1);
    });

    it('load$ should return loadMobilePhonesSuccess', async () => {
        const items = [{ id: '1' }] as MobilePhone[];
        repo.getAll.mockReturnValue(of(items));

        actions$.next(Actions.loadMobilePhones({ amount: 5 }));

        effects.load$.subscribe(action => {
            expect(repo.getAll).toHaveBeenCalledWith(5);
            expect(action).toEqual(Actions.loadMobilePhonesSuccess({ items }));
            ;
        });
    });

    it('load$ should return loadMobilePhonesFailure on error', async () => {
        repo.getAll.mockReturnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadMobilePhones({ amount: 5 }));

        effects.load$.subscribe(action => {
            expect(action).toEqual(Actions.loadMobilePhonesFailure({ error: 'Error: api failed' }));
            ;
        });
    });

    it('loadByFilter$ should return loadMobilePhoneByFilterSuccess', async () => {
        const filter: FilterMobilePhone = new MobilePhoneFilterDto({
            minimalPrice: 500,
            maximalPrice: 1500,
        });
        const items = [{ id: '1' }] as MobilePhone[];
        repo.getFilteredMobilePhones.mockReturnValue(of(items));

        actions$.next(Actions.loadMobilePhoneByFilter({ filter }));

        effects.loadByFilter$.subscribe(action => {
            expect(repo.getFilteredMobilePhones).toHaveBeenCalledWith(filter);
            expect(action).toEqual(Actions.loadMobilePhoneByFilterSuccess({ items }));
            ;
        });
    });

    it('loadByFilter$ should return loadMobilePhoneByFilterFailure on error', async () => {
        const filter: FilterMobilePhone = new MobilePhoneFilterDto({
            minimalPrice: 500,
            maximalPrice: 1500,
        });
        repo.getFilteredMobilePhones.mockReturnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadMobilePhoneByFilter({ filter }));

        effects.loadByFilter$.subscribe(action => {
            expect(action).toEqual(Actions.loadMobilePhoneByFilterFailure({ error: 'Error: api failed' }));
            ;
        });
    });

    it('loadTop$ should return loadTopMobilePhoneSuccess', async () => {
        const items = [{ id: '1' }] as TopMobilePhone[];
        repo.getTopMobilePhones.mockReturnValue(of(items));

        actions$.next(Actions.loadTopMobilePhone());

        effects.loadTop$.subscribe(action => {
            expect(repo.getTopMobilePhones).toHaveBeenCalled();
            expect(action).toEqual(Actions.loadTopMobilePhoneSuccess({ items }));
            ;
        });
    });

    it('loadTop$ should return loadTopMobilePhoneFailure on error', async () => {
        repo.getTopMobilePhones.mockReturnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadTopMobilePhone());

        effects.loadTop$.subscribe(action => {
            expect(action).toEqual(Actions.loadTopMobilePhoneFailure({ error: 'Error: api failed' }));
            ;
        });
    });

    it('loadById$ should return loadMobilePhoneByIdSuccess', async () => {
        const item = { id: '1' } as MobilePhoneDetails;
        repo.getById.mockReturnValue(of(item));

        actions$.next(Actions.loadMobilePhoneById({ id: '1' }));

        effects.loadById$.subscribe(action => {
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(action).toEqual(Actions.loadMobilePhoneByIdSuccess({ item }));
            ;
        });
    });

    it('loadById$ should return loadMobilePhoneByIdFailure on error', async () => {
        repo.getById.mockReturnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadMobilePhoneById({ id: '1' }));

        effects.loadById$.subscribe(action => {
            expect(action).toEqual(Actions.loadMobilePhoneByIdFailure({ error: 'Error: api failed' }));
            ;
        });
    });
});
