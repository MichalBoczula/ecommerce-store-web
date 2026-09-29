import { MobilePhonesBrand } from './mobile-phones-brand';

export interface FilterMobilePhone {
    brand?: MobilePhonesBrand | null;
    minimalPrice?: number | null;
    maximalPrice?: number | null;
}
