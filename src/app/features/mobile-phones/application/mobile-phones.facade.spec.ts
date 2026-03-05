import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MobilePhonesFacade } from './mobile-phones.facade';
import * as Actions from '../state/mobile-phones.actions';
import { mobilePhonesFeature, MobilePhonesState } from '../state/mobile-phones.feature';
import { firstValueFrom } from 'rxjs';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';
import { MobilePhone } from '../domain/model/mobile-phone';

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
        const items = [{ id: '1' }] as MobilePhone[];

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

    it('should expose details$ from store', async () => {
        const selectedItem = { id: 'details-1' } as MobilePhoneDetails;

        store.overrideSelector(mobilePhonesFeature.selectSelectedItem, selectedItem);
        store.refreshState();

        const result = await firstValueFrom(facade.details$);

        expect(result).toEqual(selectedItem);
    });

    it('should expose top$ from store', async () => {
        const topMobilePhones = [{ id: 'top-1' }] as TopMobilePhone[];

        store.overrideSelector(mobilePhonesFeature.selectTopMobilePhones, topMobilePhones);
        store.refreshState();

        const result = await firstValueFrom(facade.top$);

        expect(result).toEqual(topMobilePhones);
    });
});