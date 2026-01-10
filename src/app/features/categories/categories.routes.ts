import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { categoriesFeature } from './state/categories.feature';
import { CategoriesEffects } from './state/categories.effects';
import { CategoriesFacade } from './application/categories.facade';

import { CategoriesRepository } from './domain/interfaces/categories-repository';
import { CategoriesNswagRepository } from './infrastructure/api/categories-nswag.repository';

export const CATEGORIES_ROUTES: Routes = [
    {
        path: '',
        providers: [
            provideState(categoriesFeature),
            provideEffects([CategoriesEffects]),
            CategoriesFacade,
            { provide: CategoriesRepository, useClass: CategoriesNswagRepository },
        ],
        loadComponent: () =>
            import('../categories/presentation/categories-list/categories-list').then(m => m.CategoriesList),
    },
];
