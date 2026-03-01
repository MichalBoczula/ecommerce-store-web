import { createAction, props } from '@ngrx/store';
import { MobilePhone } from '../domain/model/mobile-phone';
import { MobilePhoneDetails } from '../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../domain/model/top-mobile-phone';
import { FilterMobilePhone } from '../domain/model/filter-mobile-phones';

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

export const loadTopMobilePhone = createAction(
    '[MobilePhones] Load Top Mobile Phones'
);
export const loadTopMobilePhoneSuccess = createAction(
    '[MobilePhones] Load Top Mobile Phones Success',
    props<{ items: TopMobilePhone[] }>()
);
export const loadTopMobilePhoneFailure = createAction(
    '[MobilePhones] Load Top Mobile Phones Failure',
    props<{ error: string }>()
);

export const loadMobilePhoneByFilter = createAction(
    '[MobilePhones] Load Mobile Phones By Filter',
    props<{ filter: FilterMobilePhone }>()
);
export const loadMobilePhoneByFilterSuccess = createAction(
    '[MobilePhones] Load Mobile Phones By Filter Success',
    props<{ items: MobilePhone[] }>()
);
export const loadMobilePhoneByFilterFailure = createAction(
    '[MobilePhones] Load Mobile Phones By Filter Failure',
    props<{ error: string }>()
);