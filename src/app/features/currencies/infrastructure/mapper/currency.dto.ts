import { CurrencyDto } from "../../../../shared/api/nswag/api-client";
import { Currency } from "../../domain/model/currency.model";

export function mapCurrencyDtoToDomain(dto: CurrencyDto): Currency {
    return {
        id: dto.id,
        code: dto.code,
        description: dto.description,
        isActive: dto.isActive,
    };
}