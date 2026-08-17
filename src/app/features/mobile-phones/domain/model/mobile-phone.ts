import { Money } from "./common/mobile-phone-common.model";

export interface MobilePhone {
    id: string;
    brand?: string | null;
    camera?: string | null;
    displayType?: string | null;
    name?: string | null;
    price?: Money | null;
    screenSizeInches?: number | null;
    isFavorite: boolean;
}