import { createFeature, createReducer, on } from '@ngrx/store';
import * as Actions from './categories.actions';
import { Category } from '../domain/model/category.model';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CategoriesState {
    status: LoadStatus;
    items: Category[];
    error: string | null;
}

const initialState: CategoriesState = {
    status: 'idle',
    items: [],
    error: null,
};

export const categoriesFeature = createFeature({
    name: 'categories',
    reducer: createReducer(
        initialState,
        on(Actions.loadCategories, s => ({ ...s, status: 'loading', error: null })),
        on(Actions.loadCategoriesSuccess, (s, { items }) => ({ ...s, status: 'loaded', items })),
        on(Actions.loadCategoriesFailure, (s, { error }) => ({ ...s, status: 'error', error })),
    ),
});
