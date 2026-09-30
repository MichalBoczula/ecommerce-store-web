import { describe, expect, it } from 'vitest';
import { mapCustomerProfile } from '../infrastructure/mappers/customer-profile.mapper';
import { profileDto } from '../infrastructure/mappers/customer-profile.fixture';
import { CustomerProfileActions } from './customer-profile.actions';
import { customerProfileFeature } from './customer-profile.feature';

describe('customer profile state', () => {
    it('keeps old profile data out of a missing lookup and handles conflicts', () => {
        const profile = mapCustomerProfile(profileDto);
        let state = customerProfileFeature.reducer(undefined, CustomerProfileActions.loadSuccess({ profile }));
        state = customerProfileFeature.reducer(state, CustomerProfileActions.load({ externalId: 'missing' }));
        expect(state.profile).toBeNull();
        state = customerProfileFeature.reducer(state, CustomerProfileActions.loadFailure({
            error: 'Not found', notFound: true,
        }));
        expect(state.loadStatus).toBe('notFound');
        state = customerProfileFeature.reducer(state, CustomerProfileActions.loadSuccess({ profile }));
        state = customerProfileFeature.reducer(state, CustomerProfileActions.save({
            clientId: profile.id, individual: profile.individual,
        }));
        state = customerProfileFeature.reducer(state, CustomerProfileActions.saveFailure({
            error: 'Conflict', conflict: true, notFound: false,
        }));
        expect(state.profile).toEqual(profile);
        expect(state.saveStatus).toBe('conflict');
        state = customerProfileFeature.reducer(state, CustomerProfileActions.saveSuccess({ profile }));
        expect(state.saveStatus).toBe('saved');
    });
});
