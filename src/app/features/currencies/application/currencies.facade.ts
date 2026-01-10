import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as CurrenciesActions from '../state/currencies.actions'

@Injectable()
export class CurrenciesFacade {
    private readonly store = inject(Store);

    load(): void {
        this.store.dispatch(CurrenciesActions.loadCurrencies());
    }
}