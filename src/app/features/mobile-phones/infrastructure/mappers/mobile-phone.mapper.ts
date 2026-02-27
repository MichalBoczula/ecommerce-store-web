import { MobilePhone } from '../../domain/model/mobile-phone';
import { CreateMobilePhone } from '../../domain/model/create-mobile-phone';
import { CreateMobilePhoneExternalDto, MobilePhoneDetailsDto, MobilePhoneDto, TopMobilePhoneDto } from '../../../../shared/api/nswag/api-client';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';
import { TopMobilePhone } from '../../domain/model/top-mobile-phone';

export function mapMobilePhoneDtoToMobilePhonesDetails(dto: MobilePhoneDetailsDto): MobilePhoneDetails {
    return dto;
}

export function mapMobilePhoneDtoToMobilePhones(dto: MobilePhoneDto): MobilePhone {
    return dto;
}

export function mapCreateMobilePhoneToDto(model: CreateMobilePhone): CreateMobilePhoneExternalDto {
    return CreateMobilePhoneExternalDto.fromJS(model);
}

export function mapTopMobilePhoneDtoToTopMobilePhone(dto: TopMobilePhoneDto): TopMobilePhone {
    return dto;
}
