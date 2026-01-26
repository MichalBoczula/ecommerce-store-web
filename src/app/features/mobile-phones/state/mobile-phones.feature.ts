import { createFeature, createReducer, on } from '@ngrx/store';
import * as Actions from './mobile-phones.actions';
import { MobilePhone } from '../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface MobilePhonesState {
    status: LoadStatus;
    items: MobilePhone[];
    selectedItem: MobilePhoneDetails | null;
    error: string | null;
}

const initialState: MobilePhonesState = {
    status: 'idle',
    items: [],
    selectedItem: null,
    error: null,
};

export const mobilePhonesFeature = createFeature({
    name: 'mobilePhones',
    reducer: createReducer(
        initialState,
        on(Actions.loadMobilePhones, s => ({ ...s, status: 'loading', error: null })),
        on(Actions.loadMobilePhonesSuccess, (s, { items }) => ({ ...s, status: 'loaded', items })),
        on(Actions.loadMobilePhonesFailure, (s, { error }) => ({ ...s, status: 'error', error })),
        on(Actions.loadMobilePhoneById, s => ({ ...s, status: 'loading', error: null })),
        on(Actions.loadMobilePhoneByIdSuccess, (s, { item }) => ({
            ...s,
            status: 'loaded',
            selectedItem: item,
        })),
        on(Actions.loadMobilePhoneByIdFailure, (s, { error }) => ({ ...s, status: 'error', error })),
        on(Actions.createMobilePhone, s => ({ ...s, status: 'loading', error: null })),
        on(Actions.createMobilePhoneSuccess, (s, { item }) => ({
            ...s,
            status: 'loaded'
        })),
        on(Actions.createMobilePhoneFailure, (s, { error }) => ({ ...s, status: 'error', error })),
    ),
});
