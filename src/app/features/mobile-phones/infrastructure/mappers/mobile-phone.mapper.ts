import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDetailsDto, MobilePhoneDto, MobilePhoneFilterDto, TopMobilePhoneDto } from '../../infrastructure/api-clients/products/models';
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
    return dto;
}

export function mapFilterMobilePhoneToDto(filter: FilterMobilePhone): MobilePhoneFilterDto {
    return filter as MobilePhoneFilterDto;
}