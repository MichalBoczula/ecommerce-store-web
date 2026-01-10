import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { categoriesFeature } from '../state/categories.feature';
import * as Actions from '../state/categories.actions';

@Injectable()
export class CategoriesFacade {
    private readonly store = inject(Store);

    readonly items$ = this.store.select(categoriesFeature.selectItems);
    readonly status$ = this.store.select(categoriesFeature.selectStatus);
    readonly error$ = this.store.select(categoriesFeature.selectError);

    load(): void {
        this.store.dispatch(Actions.loadCategories());
    }
}