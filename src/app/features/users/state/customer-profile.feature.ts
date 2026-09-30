import { createFeature, createReducer, on } from '@ngrx/store';
import { CustomerProfile } from '../domain/model/customer-profile';
import { CustomerProfileActions } from './customer-profile.actions';

interface ProfileState {
    profile: CustomerProfile | null;
    loadStatus: 'idle' | 'loading' | 'loaded' | 'notFound' | 'error';
    saveStatus: 'idle' | 'saving' | 'saved' | 'conflict' | 'notFound' | 'error';
    error: string | null;
}
const initialState: ProfileState = {
    profile: null, loadStatus: 'idle', saveStatus: 'idle', error: null,
};
export const customerProfileFeature = createFeature({
    name: 'customerProfile',
    reducer: createReducer(
        initialState,
        on(CustomerProfileActions.load, state => ({
            ...state, profile: null, loadStatus: 'loading' as const, saveStatus: 'idle' as const, error: null,
        })),
        on(CustomerProfileActions.loadSuccess, (state, { profile }) => ({
            ...state, profile, loadStatus: 'loaded' as const, error: null,
        })),
        on(CustomerProfileActions.loadFailure, (state, { error, notFound }) => ({
            ...state, profile: null, loadStatus: notFound ? 'notFound' as const : 'error' as const, error,
        })),
        on(CustomerProfileActions.save, CustomerProfileActions.saveCompany, state => ({
            ...state, saveStatus: 'saving' as const, error: null,
        })),
        on(CustomerProfileActions.saveSuccess, (state, { profile }) => ({
            ...state, profile, saveStatus: 'saved' as const, error: null,
        })),
        on(CustomerProfileActions.saveFailure, (state, { error, conflict, notFound }) => ({
            ...state, saveStatus: conflict ? 'conflict' as const : notFound ? 'notFound' as const : 'error' as const, error,
        })),
    ),
});
