import { createAction, props } from "@ngrx/store";
import { Currency } from "../domain/model/currency.model";

export const loadCurrencies = createAction('[Currencies] Load');
export const loadCurrenciesSuccess = createAction(
    '[Currencies] Load Success',
    props<{ items: Currency[] }>()
);
export const loadCurrenciesFailure = createAction(
    '[Currencies] Load Failure',
    props<{ error: string }>()
);
