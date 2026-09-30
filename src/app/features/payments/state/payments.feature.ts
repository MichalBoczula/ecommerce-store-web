import { createFeature, createReducer, on } from '@ngrx/store';
import { Payment } from '../domain/model/payment';
import { PaymentsActions } from './payments.actions';

export type PaymentLoadStatus = 'idle' | 'loading' | 'ready' | 'preparing' | 'error';

export interface PaymentsState {
    orderId: string | null;
    payment: Payment | null;
    status: PaymentLoadStatus;
    error: string | null;
}

const initialState: PaymentsState = {
    orderId: null, payment: null, status: 'idle', error: null,
};

export const paymentsFeature = createFeature({
    name: 'payments',
    reducer: createReducer(
        initialState,
        on(PaymentsActions.load, (state, { orderId }) => ({
            ...state, orderId, payment: null, status: 'loading' as const, error: null,
        })),
        on(PaymentsActions.loadSuccess, (state, { orderId, payment }) => orderId === state.orderId
            ? { ...state, payment, status: 'ready' as const, error: null } : state),
        on(PaymentsActions.loadFailure, (state, { orderId, error }) => orderId === state.orderId
            ? { ...state, status: 'error' as const, error } : state),
        on(PaymentsActions.prepare, (state, { orderId }) => orderId === state.orderId
            ? { ...state, status: 'preparing' as const, error: null } : state),
        on(PaymentsActions.prepareSuccess, (state, { orderId, payment }) => orderId === state.orderId
            ? { ...state, payment, status: 'ready' as const, error: null } : state),
        on(PaymentsActions.prepareFailure, (state, { orderId, error }) => orderId === state.orderId
            ? { ...state, status: 'error' as const, error } : state),
    ),
});
