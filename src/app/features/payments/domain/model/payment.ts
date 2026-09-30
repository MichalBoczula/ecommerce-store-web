export interface Payment {
    id: string;
    orderId: string;
    status: string;
    amountMinor: number;
    currency: string;
}
