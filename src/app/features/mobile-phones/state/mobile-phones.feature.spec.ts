import * as Actions from './mobile-phones.actions';
import { mobilePhonesFeature, MobilePhonesState } from './mobile-phones.feature';
import { MobilePhone } from '../domain/model/mobile-phone';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';

describe('mobilePhonesFeature reducer', () => {
  const reducer = mobilePhonesFeature.reducer;

  const initialState: MobilePhonesState = {
    status: 'idle',
    catalogStatus: 'idle',
    catalogError: null,
    topStatus: 'idle',
    topError: null,
    items: [],
    topMobilePhones: [],
    selectedItem: null,
    error: null,
  };

  it('should return initial state for unknown action', () => {
    const action = { type: 'Unknown' };

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

    const result = reducer(initialState, Actions.loadMobilePhonesSuccess({ items }));

    expect(result.status).toBe('loaded');
    expect(result.items).toEqual(items);
  });

  it('should set error and error status on loadMobilePhonesFailure', () => {
    const result = reducer(initialState, Actions.loadMobilePhonesFailure({ error: 'boom' }));

    expect(result.status).toBe('error');
    expect(result.error).toBe('boom');
  });

  it('should set loading and clear error on loadTopMobilePhone', () => {
    const state: MobilePhonesState = {
      ...initialState,
      error: 'old error',
    };

    const result = reducer(state, Actions.loadTopMobilePhone());

    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('should set topMobilePhones and loaded on loadTopMobilePhoneSuccess', () => {
    const items = [{ id: '1' }, { id: '2' }] as TopMobilePhone[];

    const result = reducer(initialState, Actions.loadTopMobilePhoneSuccess({ items }));

    expect(result.status).toBe('loaded');
    expect(result.topMobilePhones).toEqual(items);
  });

  it('should set error and error status on loadTopMobilePhoneFailure', () => {
    const result = reducer(initialState, Actions.loadTopMobilePhoneFailure({ error: 'boom' }));

    expect(result.status).toBe('error');
    expect(result.error).toBe('boom');
  });

  it('should set loading and clear error on loadTopMobilePhone', () => {
    const state: MobilePhonesState = {
      ...initialState,
      error: 'old error',
    };

    const result = reducer(state, Actions.loadTopMobilePhone());

    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('should set topMobilePhones and loaded on loadTopMobilePhoneSuccess', () => {
    const items = [{ id: '1' }, { id: '2' }] as TopMobilePhone[];

    const result = reducer(initialState, Actions.loadTopMobilePhoneSuccess({ items }));

    expect(result.status).toBe('loaded');
    expect(result.topMobilePhones).toEqual(items);
  });

  it('should set error and error status on loadTopMobilePhoneFailure', () => {
    const result = reducer(initialState, Actions.loadTopMobilePhoneFailure({ error: 'boom' }));

    expect(result.status).toBe('error');
    expect(result.error).toBe('boom');
  });

  it('should set loading and clear error on loadMobilePhoneByFilter', () => {
    const state: MobilePhonesState = {
      ...initialState,
      error: 'old error',
    };

    const result = reducer(
      state,
      Actions.loadMobilePhoneByFilter({
        filter: {},
      }),
    );

    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('should set items and loaded on loadMobilePhoneByFilterSuccess', () => {
    const items = [{ id: '1' }, { id: '2' }] as MobilePhone[];

    const result = reducer(initialState, Actions.loadMobilePhoneByFilterSuccess({ items }));

    expect(result.status).toBe('loaded');
    expect(result.items).toEqual(items);
  });

  it('should set error and error status on loadMobilePhoneByFilterFailure', () => {
    const result = reducer(initialState, Actions.loadMobilePhoneByFilterFailure({ error: 'boom' }));

    expect(result.status).toBe('error');
    expect(result.error).toBe('boom');
  });
  it('keeps catalog loading independent from a late home response', () => {
    const catalogLoading = reducer(
      initialState,
      Actions.loadMobilePhoneByFilter({ filter: { brand: 'Apple' } }),
    );
    const homeLoaded = reducer(catalogLoading, Actions.loadTopMobilePhoneSuccess({ items: [] }));
    expect(homeLoaded.catalogStatus).toBe('loading');
    expect(homeLoaded.topStatus).toBe('loaded');
    const catalogFailed = reducer(
      homeLoaded,
      Actions.loadMobilePhoneByFilterFailure({ error: 'Unavailable' }),
    );
    expect(catalogFailed.catalogStatus).toBe('error');
    expect(catalogFailed.catalogError).toBe('Unavailable');
    expect(catalogFailed.topStatus).toBe('loaded');
  });
});
