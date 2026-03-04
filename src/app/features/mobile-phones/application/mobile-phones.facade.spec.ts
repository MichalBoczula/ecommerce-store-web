import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { MobilePhonesFacade } from './mobile-phones.facade';
import * as Actions from '../state/mobile-phones.actions';
import { mobilePhonesFeature, MobilePhonesState } from '../state/mobile-phones.feature';
import { firstValueFrom } from 'rxjs';

describe('MobilePhonesFacade', () => {
    let facade: MobilePhonesFacade;
    let store: MockStore;
    let dispatchSpy: jasmine.Spy;

    const initialFeatureState: MobilePhonesState = {
        status: 'idle',
        items: [],
        topMobilePhones: [],
        selectedItem: null,
        error: null,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MobilePhonesFacade,
                provideMockStore({
                    initialState: {
                        mobilePhones: initialFeatureState,
                    },
                }),
            ],
        });

        facade = TestBed.inject(MobilePhonesFacade);
        store = TestBed.inject(MockStore);
        dispatchSpy = spyOn(store, 'dispatch');
    });

    it('should dispatch loadMobilePhones', () => {
        facade.load(10);

        expect(dispatchSpy).toHaveBeenCalledWith(
            Actions.loadMobilePhones({ amount: 10 })
        );
    });

    it('should dispatch loadMobilePhoneById', () => {
        facade.loadById('abc');

        expect(dispatchSpy).toHaveBeenCalledWith(
            Actions.loadMobilePhoneById({ id: 'abc' })
        );
    });

    it('should dispatch loadTopMobilePhone', () => {
        facade.loadTop();

        expect(dispatchSpy).toHaveBeenCalledWith(
            Actions.loadTopMobilePhone()
        );
    });

    it('should dispatch loadMobilePhoneByFilter', () => {
        const filter = { brand: 'Apple' } as any;

        facade.loadByFilter(filter);

        expect(dispatchSpy).toHaveBeenCalledWith(
            Actions.loadMobilePhoneByFilter({ filter })
        );
    });

    it('should expose items$ from store', async () => {
        const items = [{ id: '1' }] as any[];

        store.overrideSelector(mobilePhonesFeature.selectItems, items);
        store.refreshState();

        const result = await firstValueFrom(facade.items$);

        expect(result).toEqual(items);
    });

    it('should expose status$ from store', async () => {
        store.overrideSelector(mobilePhonesFeature.selectStatus, 'loaded');
        store.refreshState();

        const result = await firstValueFrom(facade.status$);

        expect(result).toBe('loaded');
    });

    it('should expose error$ from store', async () => {
        store.overrideSelector(mobilePhonesFeature.selectError, 'boom');
        store.refreshState();

        const result = await firstValueFrom(facade.error$);

        expect(result).toBe('boom');
    });
});