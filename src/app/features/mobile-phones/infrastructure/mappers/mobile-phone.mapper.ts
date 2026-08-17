import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDto, MobilePhoneFilterDto, MobilePhonesBrand, TopMobilePhoneDto } from '../../infrastructure/api-clients/products/models';
import { TopMobilePhone } from '../../domain/model/top-mobile-phone';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';

import { MobilePhoneDetailsDto } from '../../infrastructure/api-clients/products/models';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';

export function mapMobilePhoneDtoToMobilePhonesDetails(
    dto: MobilePhoneDetailsDto
): MobilePhoneDetails {
    return {
        id: dto.id?.toString() ?? '',
        categoryId: dto.categoryId?.toString() ?? null,
        camera: dto.camera ?? null,
        description2: dto.description2 ?? null,
        description3: dto.description3 ?? null,
        faceId: dto.faceId ?? null,
        fingerPrint: dto.fingerPrint ?? null,
        isActive: dto.isActive ?? null,

        price: dto.price
            ? {
                amount: dto.price.amount ?? null,
                currency: dto.price.currency ?? null,
            }
            : null,

        commonDescription: dto.commonDescription
            ? {
                brand: dto.commonDescription.brand ?? null,
                description: dto.commonDescription.description ?? null,
                mainPhoto: dto.commonDescription.mainPhoto ?? null,
                name: dto.commonDescription.name ?? null,
                otherPhotos: dto.commonDescription.otherPhotos ? [...dto.commonDescription.otherPhotos] : null,
            }
            : null,

        connectivity: dto.connectivity
            ? {
                bluetooth: dto.connectivity.bluetooth ?? null,
                has5G: dto.connectivity.has5G ?? null,
                nfc: dto.connectivity.nfc ?? null,
                wiFi: dto.connectivity.wiFi ?? null,
            }
            : null,

        electronicDetails: dto.electronicDetails
            ? {
                batteryCapacity: dto.electronicDetails.batteryCapacity ?? null,
                batteryType: dto.electronicDetails.batteryType ?? null,
                cpu: dto.electronicDetails.cpu ?? null,
                displayType: dto.electronicDetails.displayType ?? null,
                gpu: dto.electronicDetails.gpu ?? null,
                height: dto.electronicDetails.height ?? null,
                ram: dto.electronicDetails.ram ?? null,
                refreshRateHz: dto.electronicDetails.refreshRateHz ?? null,
                screenSizeInches: dto.electronicDetails.screenSizeInches ?? null,
                storage: dto.electronicDetails.storage ?? null,
                width: dto.electronicDetails.width ?? null,
            }
            : null,

        satelliteNavigationSystems: dto.satelliteNavigationSystems
            ? {
                agps: dto.satelliteNavigationSystems.agps ?? null,
                galileo: dto.satelliteNavigationSystems.galileo ?? null,
                glonass: dto.satelliteNavigationSystems.glonass ?? null,
                gps: dto.satelliteNavigationSystems.gps ?? null,
                qzss: dto.satelliteNavigationSystems.qzss ?? null,
            }
            : null,

        sensors: dto.sensors
            ? {
                accelerometer: dto.sensors.accelerometer ?? null,
                ambientLight: dto.sensors.ambientLight ?? null,
                barometer: dto.sensors.barometer ?? null,
                compass: dto.sensors.compass ?? null,
                gyroscope: dto.sensors.gyroscope ?? null,
                halla: dto.sensors.halla ?? null,
                proximity: dto.sensors.proximity ?? null,
            }
            : null,
    };
}

export function mapMobilePhoneDtoToMobilePhones(dto: MobilePhoneDto, isFav: boolean = false): MobilePhone {
    return {
        id: dto.id?.toString() ?? '',
        brand: dto.brand ?? null,
        camera: dto.camera ?? null,
        displayType: dto.displayType ?? null,
        name: dto.name ?? null,
        screenSizeInches: dto.screenSizeInches ?? null,
        price: dto.price ? {
            amount: dto.price.amount ?? null,
            currency: dto.price.currency ?? null,
        } : null,
        isFavorite: isFav,
    };
}

export function mapTopMobilePhoneDtoToTopMobilePhone(dto: TopMobilePhoneDto): TopMobilePhone {
    return {
        id: dto.id?.toString() ?? '',
        commonDescription: dto.commonDescription ? {
            name: dto.commonDescription.name ?? null,
            brand: dto.commonDescription.brand ?? null,
            description: dto.commonDescription.description ?? null,
            mainPhoto: dto.commonDescription.mainPhoto ?? null,
        } : null,
        price: dto.price ? {
            amount: dto.price.amount ?? 0,
            currency: dto.price.currency ?? 'USD',
        } : null,
    };
}

export function mapFilterMobilePhoneToDto(filter: FilterMobilePhone): MobilePhoneFilterDto {
    return {
        brand: filter.brand as MobilePhonesBrand | undefined | null,
        minimalPrice: filter.minimalPrice,
        maximalPrice: filter.maximalPrice,
    };
}