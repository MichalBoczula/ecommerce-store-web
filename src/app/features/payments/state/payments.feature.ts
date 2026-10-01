import { createFeature, createReducer, on } from '@ngrx/store';
import { PaymentProgress, progressComplete } from '../domain/model/checkout';
import { Payment } from '../domain/model/payment';
import { PaymentsActions } from './payments.actions';

export type PaymentLoadStatus = 'idle' | 'loading' | 'ready' | 'preparing' | 'watching' | 'checkingout' | 'error';

export interface PaymentsState {
    orderId: string | null;
    clientId: string | null;
    progress: PaymentProgress | null;
    exhausted: boolean;
    payment: Payment | null;
    status: PaymentLoadStatus;
    error: string | null;
}

const initialState: PaymentsState = {
    clientId: null, progress: null, exhausted: false, orderId: null, payment: null, status: 'idle', error: null,
};

export const paymentsFeature = createFeature({
    name: 'payments',
    reducer: createReducer(
        initialState,
        on(PaymentsActions.watch, (state, { clientId, orderId }) => ({
            ...state, clientId, orderId, progress: null, payment: null, exhausted: false, status: 'watching' as const, error: null,
        })),
        on(PaymentsActions.stopWatching, () => initialState),
        on(PaymentsActions.watchSuccess, (state, { clientId, orderId, progress, exhausted }) =>
            orderId === state.orderId && clientId === state.clientId ? {
                ...state, progress, payment: progress.payment, exhausted,
                status: progressComplete(progress) || exhausted ? 'ready' as const : 'watching' as const, error: null,
            } : state),
        on(PaymentsActions.watchFailure, (state, { clientId, orderId, error }) =>
            orderId === state.orderId && clientId === state.clientId ? { ...state, status: 'error' as const, error } : state),
        on(PaymentsActions.checkout, (state, { clientId, orderId }) =>
            orderId === state.orderId && clientId === state.clientId ? { ...state, status: 'checkingout' as const, error: null } : state),
        on(PaymentsActions.checkoutSuccess, (state, { clientId, orderId, payment }) =>
            orderId === state.orderId && clientId === state.clientId ? { ...state, payment, status: 'ready' as const } : state),
        on(PaymentsActions.checkoutFailure, (state, { clientId, orderId, error }) =>
            orderId === state.orderId && clientId === state.clientId ? { ...state, status: 'error' as const, error } : state),
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
