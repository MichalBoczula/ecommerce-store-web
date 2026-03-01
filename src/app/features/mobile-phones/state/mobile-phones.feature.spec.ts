import * as Actions from './mobile-phones.actions';
import {
    mobilePhonesFeature,
    MobilePhonesState,
} from './mobile-phones.feature';
import { MobilePhone } from '../domain/model/mobile-phone';

describe('mobilePhonesFeature reducer', () => {
    const reducer = mobilePhonesFeature.reducer;

    const initialState: MobilePhonesState = {
        status: 'idle',
        items: [],
        topMobilePhones: [],
        selectedItem: null,
        error: null,
    };

    it('should return initial state for unknown action', () => {
        const action = { type: 'Unknown' } as any;

        const state = reducer(undefined, action);

        expect(state).toEqual(initialState);
    });

    it('should set loading and clear error on loadMobilePhones', () => {
        const state: MobilePhonesState = {
            ...initialState,
            error: 'old error',
        };

        const result = reducer(state, Actions.loadMobilePhones({ amount: 10 }));

        expect(result.status).toBe('loading');
        expect(result.error).toBeNull();
    });

    it('should set items and loaded on loadMobilePhonesSuccess', () => {
        const items = [{ id: '1' }, { id: '2' }] as MobilePhone[];

        const result = reducer(
            initialState,
            Actions.loadMobilePhonesSuccess({ items })
        );

        expect(result.status).toBe('loaded');
        expect(result.items).toEqual(items);
    });

    it('should set error and error status on loadMobilePhonesFailure', () => {
        const result = reducer(
            initialState,
            Actions.loadMobilePhonesFailure({ error: 'boom' })
        );

        expect(result.status).toBe('error');
        expect(result.error).toBe('boom');
    });
});