import { createAction, props } from '@ngrx/store';
import { MobilePhone } from '../domain/model/mobile-phone';

export const loadMobilePhones = createAction(
    '[MobilePhones] Load',
    props<{ amount: number }>()
);
export const loadMobilePhonesSuccess = createAction(
    '[MobilePhones] Load Success',
    props<{ items: MobilePhone[] }>()
);
export const loadMobilePhonesFailure = createAction(
    '[MobilePhones] Load Failure',
    props<{ error: string }>()
);
