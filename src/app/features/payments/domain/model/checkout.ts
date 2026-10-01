import { Order } from '../../../orders/domain/model/order';
import { Payment } from './payment';

export interface Checkout {
    payment: Payment;
    url: string | null;
    status: 'open' | 'complete' | 'expired';
}

export interface CompletedInvoice {
    id: string;
    orderId: string;
    createdAt: Date;
}

export interface PaymentProgress {
    payment: Payment | null;
    order: Order;
    invoice: CompletedInvoice | null;
}

export function progressComplete(progress: PaymentProgress): boolean {
    return (progress.payment?.status === 'succeeded' && progress.order.status === 'Paid' && !!progress.invoice) ||
        progress.payment?.status === 'failed' || progress.payment?.status === 'cancelled';
}
