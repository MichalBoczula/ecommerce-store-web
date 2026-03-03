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
    let repo: jasmine.SpyObj<MobilePhonesRepository>;

    beforeEach(() => {
        repo = jasmine.createSpyObj<MobilePhonesRepository>('MobilePhonesRepository', [
            'getAll',
            'getById',
            'create',
            'getTopMobilePhones',
            'getFilteredMobilePhones',
        ]);

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

    it('load$ should return loadMobilePhonesSuccess', (done) => {
        const items = [{ id: '1' }] as MobilePhone[];
        repo.getAll.and.returnValue(of(items));

        actions$.next(Actions.loadMobilePhones({ amount: 5 }));

        effects.load$.subscribe(action => {
            expect(repo.getAll).toHaveBeenCalledWith(5);
            expect(action).toEqual(Actions.loadMobilePhonesSuccess({ items }));
            done();
        });
    });

    it('load$ should return loadMobilePhonesFailure on error', (done) => {
        repo.getAll.and.returnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadMobilePhones({ amount: 5 }));

        effects.load$.subscribe(action => {
            expect(action).toEqual(
                Actions.loadMobilePhonesFailure({ error: 'Error: api failed' })
            );
            done();
        });
    });

    it('loadByFilter$ should return loadMobilePhoneByFilterSuccess', (done) => {
        const filter: FilterMobilePhone = new MobilePhoneFilterDto({
            minimalPrice: 500,
            maximalPrice: 1500,
        });
        const items = [{ id: '1' }] as MobilePhone[];
        repo.getFilteredMobilePhones.and.returnValue(of(items));

        actions$.next(Actions.loadMobilePhoneByFilter({ filter }));

        effects.loadByFilter$.subscribe(action => {
            expect(repo.getFilteredMobilePhones).toHaveBeenCalledWith(filter);
            expect(action).toEqual(Actions.loadMobilePhoneByFilterSuccess({ items }));
            done();
        });
    });

    it('loadByFilter$ should return loadMobilePhoneByFilterFailure on error', (done) => {
        const filter: FilterMobilePhone = new MobilePhoneFilterDto({
            minimalPrice: 500,
            maximalPrice: 1500,
        });
        repo.getFilteredMobilePhones.and.returnValue(
            throwError(() => new Error('api failed'))
        );

        actions$.next(Actions.loadMobilePhoneByFilter({ filter }));

        effects.loadByFilter$.subscribe(action => {
            expect(action).toEqual(
                Actions.loadMobilePhoneByFilterFailure({ error: 'Error: api failed' })
            );
            done();
        });
    });

    it('loadTop$ should return loadTopMobilePhoneSuccess', (done) => {
        const items = [{ id: '1' }] as TopMobilePhone[];
        repo.getTopMobilePhones.and.returnValue(of(items));

        actions$.next(Actions.loadTopMobilePhone());

        effects.loadTop$.subscribe(action => {
            expect(repo.getTopMobilePhones).toHaveBeenCalled();
            expect(action).toEqual(Actions.loadTopMobilePhoneSuccess({ items }));
            done();
        });
    });

    it('loadTop$ should return loadTopMobilePhoneFailure on error', (done) => {
        repo.getTopMobilePhones.and.returnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadTopMobilePhone());

        effects.loadTop$.subscribe(action => {
            expect(action).toEqual(
                Actions.loadTopMobilePhoneFailure({ error: 'Error: api failed' })
            );
            done();
        });
    });

    it('loadById$ should return loadMobilePhoneByIdSuccess', (done) => {
        const item = { id: '1' } as MobilePhoneDetails;
        repo.getById.and.returnValue(of(item));

        actions$.next(Actions.loadMobilePhoneById({ id: '1' }));

        effects.loadById$.subscribe(action => {
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(action).toEqual(Actions.loadMobilePhoneByIdSuccess({ item }));
            done();
        });
    });

    it('loadById$ should return loadMobilePhoneByIdFailure on error', (done) => {
        repo.getById.and.returnValue(throwError(() => new Error('api failed')));

        actions$.next(Actions.loadMobilePhoneById({ id: '1' }));

        effects.loadById$.subscribe(action => {
            expect(action).toEqual(
                Actions.loadMobilePhoneByIdFailure({ error: 'Error: api failed' })
            );
            done();
        });
    });
});