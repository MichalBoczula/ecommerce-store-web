import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as CurrenciesActions from '../state/currencies.actions'
import { currenciesFeature } from "../state/currencies.feature";

@Injectable()
export class CurrenciesFacade {
    private readonly store = inject(Store);

    items$ = this.store.select(currenciesFeature.selectItems);
    loading$ = this.store.select(currenciesFeature.selectStatus);
    error$ = this.store.select(currenciesFeature.selectError);

    load(): void {
        this.store.dispatch(CurrenciesActions.loadCurrencies());
    }
}