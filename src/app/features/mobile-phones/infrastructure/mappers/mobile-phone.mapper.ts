import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhoneDto } from '../../../../shared/api/nswag/api-client';

export function mapMobilePhoneDtoToDomain(dto: MobilePhoneDto): MobilePhone {
    return dto;
}
