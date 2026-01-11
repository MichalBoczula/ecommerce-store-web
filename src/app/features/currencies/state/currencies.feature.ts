import { createFeature } from '@ngrx/store';
import { currenciesReducer } from './currencies.state';

export const currenciesFeature = createFeature({
    name: 'currencies',
    reducer: currenciesReducer,
});