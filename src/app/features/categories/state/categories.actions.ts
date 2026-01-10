import { createAction, props } from '@ngrx/store';
import { Category } from '../domain/model/category.model';

export const loadCategories = createAction('[Categories] Load');
export const loadCategoriesSuccess = createAction(
    '[Categories] Load Success',
    props<{ items: Category[] }>()
);
export const loadCategoriesFailure = createAction(
    '[Categories] Load Failure',
    props<{ error: string }>()
);
