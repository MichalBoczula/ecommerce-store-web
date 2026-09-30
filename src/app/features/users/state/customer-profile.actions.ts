import { createActionGroup, props } from '@ngrx/store';
import { CustomerCompany, CustomerIndividual, CustomerProfile } from '../domain/model/customer-profile';

export const CustomerProfileActions = createActionGroup({
    source: 'Customer Profile',
    events: {
        'Load': props<{ externalId: string }>(),
        'Load Success': props<{ profile: CustomerProfile }>(),
        'Load Failure': props<{ error: string; notFound: boolean }>(),
        'Save': props<{ clientId: string; individual: CustomerIndividual }>(),
        'Save Company': props<{ clientId: string; company: CustomerCompany }>(),
        'Save Success': props<{ profile: CustomerProfile }>(),
        'Save Failure': props<{ error: string; conflict: boolean; notFound: boolean }>(),
    },
});
