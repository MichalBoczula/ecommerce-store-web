import { createFeature, createReducer, on } from "@ngrx/store";
import { Currency } from "../domain/model/currency.model";
import * as CurrenciesActions from "./currencies.actions"

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CurrenciesState {
    status: LoadStatus;
    items: Currency[];
    error: string | null;
}

const initialState: CurrenciesState = {
    status: 'idle',
    items: [],
    error: null
}

export const currenciesFeature = createFeature({
    name: 'currencies',
    reducer: createReducer(
        initialState,
        on(CurrenciesActions.loadCurrencies, s => ({ ...s, status: 'loading', error: null })),
        on(CurrenciesActions.loadCurrenciesSuccess, (s, { items }) => ({ ...s, status: 'loaded', items })),
        on(CurrenciesActions.loadCurrenciesFailure, (s, { error }) => ({ ...s, status: 'error', error })),
    ),
});