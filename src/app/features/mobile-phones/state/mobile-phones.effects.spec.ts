import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';

import { MobilePhonesEffects } from './mobile-phones-effects';
import * as Actions from './mobile-phones.actions';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';

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

    it('loadById$ should return success', (done) => {
        const item = { id: 'abc' } as MobilePhoneDetails;
        repo.getById.and.returnValue(of(item));

        actions$.next(Actions.loadMobilePhoneById({ id: 'abc' }));

        effects.loadById$.subscribe(action => {
            expect(repo.getById).toHaveBeenCalledWith('abc');
            expect(action).toEqual(Actions.loadMobilePhoneByIdSuccess({ item }));
            done();
        });
    });

    it('create$ should call create and return success', (done) => {
        const created = { id: 'created-1' } as MobilePhoneDetails;
        repo.create.and.returnValue(of(created));

        actions$.next(Actions.createMobilePhone());

        effects.create$.subscribe(action => {
            expect(repo.create).toHaveBeenCalled();
            expect(action).toEqual(Actions.createMobilePhoneSuccess({ item: created }));
            done();
        });
    });

    it('loadTop$ should return success', (done) => {
        const items = [{ id: 'top-1' }] as TopMobilePhone[];
        repo.getTopMobilePhones.and.returnValue(of(items));

        actions$.next(Actions.loadTopMobilePhone());

        effects.loadTop$.subscribe(action => {
            expect(repo.getTopMobilePhones).toHaveBeenCalled();
            expect(action).toEqual(Actions.loadTopMobilePhoneSuccess({ items }));
            done();
        });
    });

    it('loadByFilter$ should return success', (done) => {
        const filter = { brand: 'Samsung' } as any;
        const items = [{ id: '1' }] as MobilePhone[];

        repo.getFilteredMobilePhones.and.returnValue(of(items));

        actions$.next(Actions.loadMobilePhoneByFilter({ filter }));

        effects.loadByFilter$.subscribe(action => {
            expect(repo.getFilteredMobilePhones).toHaveBeenCalledWith(filter);
            expect(action).toEqual(Actions.loadMobilePhoneByFilterSuccess({ items }));
            done();
        });
    });
});