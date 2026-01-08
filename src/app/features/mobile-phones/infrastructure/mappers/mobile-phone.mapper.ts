import { MobilePhone } from '../../domain/model/mobile-phone';
import { CreateMobilePhone } from '../../domain/model/create-mobile-phone';
import { CreateMobilePhoneExternalDto, MobilePhoneDto } from '../../../../shared/api/nswag/api-client';

export function mapMobilePhoneDtoToDomain(dto: MobilePhoneDto): MobilePhone {
    return dto;
}

export function mapCreateMobilePhoneToDto(model: CreateMobilePhone): CreateMobilePhoneExternalDto {
    return CreateMobilePhoneExternalDto.fromJS(model);
}
