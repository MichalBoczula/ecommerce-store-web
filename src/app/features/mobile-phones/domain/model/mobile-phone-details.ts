import { Money } from "./common/mobile-phone-common.model";

export interface CommonDescription {
    brand?: string | null;
    description?: string | null;
    mainPhoto?: string | null;
    name?: string | null;
    otherPhotos?: string[] | null;
}

export interface Connectivity {
    bluetooth?: boolean | null;
    has5G?: boolean | null;
    nfc?: boolean | null;
    wiFi?: boolean | null;
}

export interface ElectronicDetails {
    batteryCapacity?: number | null;
    batteryType?: string | null;
    cpu?: string | null;
    displayType?: string | null;
    gpu?: string | null;
    height?: number | null;
    ram?: string | null;
    refreshRateHz?: number | null;
    screenSizeInches?: number | null;
    storage?: string | null;
    width?: number | null;
}

export interface SatelliteNavigationSystem {
    agps?: boolean | null;
    galileo?: boolean | null;
    glonass?: boolean | null;
    gps?: boolean | null;
    qzss?: boolean | null;
}

export interface Sensors {
    accelerometer?: boolean | null;
    ambientLight?: boolean | null;
    barometer?: boolean | null;
    compass?: boolean | null;
    gyroscope?: boolean | null;
    halla?: boolean | null;
    proximity?: boolean | null;
}

export interface MobilePhoneDetails {
    id: string;
    categoryId?: string | null;
    camera?: string | null;
    description2?: string | null;
    description3?: string | null;
    faceId?: boolean | null;
    fingerPrint?: boolean | null;
    isActive?: boolean | null;
    price?: Money | null;
    commonDescription?: CommonDescription | null;
    connectivity?: Connectivity | null;
    electronicDetails?: ElectronicDetails | null;
    satelliteNavigationSystems?: SatelliteNavigationSystem | null;
    sensors?: Sensors | null;
}