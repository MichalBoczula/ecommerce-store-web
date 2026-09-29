import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';
import { MobilePhonesEffects } from './mobile-phones-effects';
import * as MobilePhonesActions from './mobile-phones.actions';

describe('mobile phone effects', () => {
    afterEach(() => TestBed.resetTestingModule());

    function setup(repository: Partial<MobilePhonesRepository>) {
        const actions = new Subject<Action>();
        TestBed.configureTestingModule({ providers: [
            MobilePhonesEffects,
            { provide: Actions, useValue: new Actions(actions) },
            { provide: MobilePhonesRepository, useValue: repository },
        ] });
        return { actions, effects: TestBed.inject(MobilePhonesEffects) };
    }

    it('reports a failed catalog load and can load again on retry', () => {
        const phone = { id: 'phone-1', name: 'Available', isFavorite: false };
        const getAll = vi.fn()
            .mockReturnValueOnce(throwError(() => new Error('Catalog offline')))
            .mockReturnValueOnce(of([phone]));
        const { actions, effects } = setup({ getAll });
        const results: Action[] = [];
        const subscription = effects.load$.subscribe(action => results.push(action));

        actions.next(MobilePhonesActions.loadMobilePhones({ amount: 15 }));
        actions.next(MobilePhonesActions.loadMobilePhones({ amount: 15 }));

        expect(getAll).toHaveBeenCalledTimes(2);
        expect(results).toEqual([
            MobilePhonesActions.loadMobilePhonesFailure({ error: 'Error: Catalog offline' }),
            MobilePhonesActions.loadMobilePhonesSuccess({ items: [phone] }),
        ]);
        subscription.unsubscribe();
    });

    it('passes the filter through and maps the product list', () => {
        const filter = { minimalPrice: 100, maximalPrice: 500 };
        const phone = { id: 'phone-1', isFavorite: false };
        const getFilteredMobilePhones = vi.fn(() => of([phone]));
        const { actions, effects } = setup({ getFilteredMobilePhones });
        const results: Action[] = [];
        const subscription = effects.loadByFilter$.subscribe(action => results.push(action));

        actions.next(MobilePhonesActions.loadMobilePhoneByFilter({ filter }));

        expect(getFilteredMobilePhones).toHaveBeenCalledWith(filter);
        expect(results).toEqual([MobilePhonesActions.loadMobilePhoneByFilterSuccess({ items: [phone] })]);
        subscription.unsubscribe();
    });

    it('loads a product by ID and reports a top-products failure independently', () => {
        const phone = { id: 'phone-1' };
        const getById = vi.fn(() => of(phone));
        const getTopMobilePhones = vi.fn(() => throwError(() => new Error('Top unavailable')));
        const { actions, effects } = setup({ getById, getTopMobilePhones });
        const results: Action[] = [];
        const detail = effects.loadById$.subscribe(action => results.push(action));
        const top = effects.loadTop$.subscribe(action => results.push(action));

        actions.next(MobilePhonesActions.loadMobilePhoneById({ id: phone.id }));
        actions.next(MobilePhonesActions.loadTopMobilePhone());

        expect(getById).toHaveBeenCalledWith(phone.id);
        expect(results).toEqual([
            MobilePhonesActions.loadMobilePhoneByIdSuccess({ item: phone }),
            MobilePhonesActions.loadTopMobilePhoneFailure({ error: 'Error: Top unavailable' }),
        ]);
        detail.unsubscribe();
        top.unsubscribe();
    });
});
