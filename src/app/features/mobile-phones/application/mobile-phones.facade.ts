import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { mobilePhonesFeature } from '../state/mobile-phones.feature';
import * as Actions from '../state/mobile-phones.actions';

@Injectable()
export class MobilePhonesFacade {
    private readonly store = inject(Store);

    readonly items$ = this.store.select(mobilePhonesFeature.selectItems);
    readonly status$ = this.store.select(mobilePhonesFeature.selectStatus);
    readonly error$ = this.store.select(mobilePhonesFeature.selectError);

    load(amount: number): void {
        this.store.dispatch(Actions.loadMobilePhones({ amount }));
    }
}
