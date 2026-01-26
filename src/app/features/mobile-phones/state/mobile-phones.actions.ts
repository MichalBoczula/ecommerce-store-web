import { createAction, props } from '@ngrx/store';
import { MobilePhone } from '../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';

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

export const loadMobilePhoneById = createAction(
    '[MobilePhones] Load By Id',
    props<{ id: string }>()
);
export const loadMobilePhoneByIdSuccess = createAction(
    '[MobilePhones] Load By Id Success',
    props<{ item: MobilePhoneDetails }>()
);
export const loadMobilePhoneByIdFailure = createAction(
    '[MobilePhones] Load By Id Failure',
    props<{ error: string }>()
);

export const createMobilePhone = createAction('[MobilePhones] Create');
export const createMobilePhoneSuccess = createAction(
    '[MobilePhones] Create Success',
    props<{ item: MobilePhoneDetails }>()
);
export const createMobilePhoneFailure = createAction(
    '[MobilePhones] Create Failure',
    props<{ error: string }>()
);
