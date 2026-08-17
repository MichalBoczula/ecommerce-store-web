import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDetailsDto, MobilePhoneDto, MobilePhoneFilterDto, MobilePhonesBrand, TopMobilePhoneDto } from '../../infrastructure/api-clients/products/models';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../../domain/model/top-mobile-phone';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';

export function mapMobilePhoneDtoToMobilePhonesDetails(dto: MobilePhoneDetailsDto): MobilePhoneDetails {
    return dto;
}

export function mapMobilePhoneDtoToMobilePhones(dto: MobilePhoneDto): MobilePhone {
    return dto;
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