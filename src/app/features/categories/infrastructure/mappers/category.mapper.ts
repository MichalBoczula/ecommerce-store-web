import { Category } from '../../domain/model/category.model';
import { CategoryDto } from '../../../../shared/api/nswag/api-client';

export function mapCategoryDtoToDomain(dto: CategoryDto): Category {
    return {
        id: dto.id,
        code: dto.code,
        name: dto.name,
        isActive: dto.isActive,
    };
}