import { Money } from "./common/mobile-phone-common.model";

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