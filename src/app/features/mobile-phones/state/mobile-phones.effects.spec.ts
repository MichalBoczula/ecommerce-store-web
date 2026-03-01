import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { MobilePhonesEffects } from './mobile-phones-effects';
import * as Actions from './mobile-phones.actions';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhone } from '../domain/model/mobile-phone';

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
});