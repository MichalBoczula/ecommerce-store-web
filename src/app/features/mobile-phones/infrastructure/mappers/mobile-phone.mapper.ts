import { MobilePhone } from '../../domain/model/mobile-phone';
import { CreateMobilePhone } from '../../domain/model/create-mobile-phone';
import { CreateMobilePhoneExternalDto, MobilePhoneDetailsDto, MobilePhoneDto } from '../../../../shared/api/nswag/api-client';
import { MobilePhoneDetails } from '../../domain/model/mobile-phone-details';

export function mapMobilePhoneDtoToMobilePhonesDetails(dto: MobilePhoneDetailsDto): MobilePhoneDetails {
    return dto;
}

export function mapMobilePhoneDtoToMobilePhones(dto: MobilePhoneDto): MobilePhone {
    return dto;
}

export function mapCreateMobilePhoneToDto(model: CreateMobilePhone): CreateMobilePhoneExternalDto {
    return CreateMobilePhoneExternalDto.fromJS(model);
}
