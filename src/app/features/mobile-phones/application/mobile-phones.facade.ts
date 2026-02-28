import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { mobilePhonesFeature } from '../state/mobile-phones.feature';
import * as Actions from '../state/mobile-phones.actions';
import { FilterMobilePhone } from '../domain/model/filter-mobile-phones';

@Injectable()
export class MobilePhonesFacade {
    private readonly store = inject(Store);

    readonly items$ = this.store.select(mobilePhonesFeature.selectItems);
    readonly status$ = this.store.select(mobilePhonesFeature.selectStatus);
    readonly error$ = this.store.select(mobilePhonesFeature.selectError);
    readonly details$ = this.store.select(mobilePhonesFeature.selectSelectedItem);
    readonly top$ = this.store.select(mobilePhonesFeature.selectTopMobilePhones);

    load(amount: number): void {
        this.store.dispatch(Actions.loadMobilePhones({ amount }));
    }

    loadById(id: string): void {
        this.store.dispatch(Actions.loadMobilePhoneById({ id }));
    }

    loadTop(): void {
        this.store.dispatch(Actions.loadTopMobilePhone());
    }

    loadByFilter(filter: FilterMobilePhone): void {
        this.store.dispatch(Actions.loadMobilePhoneByFilter({ filter }));
    }
}
