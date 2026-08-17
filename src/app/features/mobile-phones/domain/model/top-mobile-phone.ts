export interface Money {
    amount?: number | null;
    currency?: string | null;
}

export interface TopMobilePhonesCommonDescription {
    brand?: string | null;
    description?: string | null;
    mainPhoto?: string | null;
    name?: string | null;
}

export interface TopMobilePhone {
    id: string;
    commonDescription?: TopMobilePhonesCommonDescription | null;
    price?: Money | null;
}