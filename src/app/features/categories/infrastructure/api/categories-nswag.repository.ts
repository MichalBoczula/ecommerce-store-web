import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { CategoriesRepository } from '../../domain/interfaces/categories-repository.port';
import { Category } from '../../domain/model/category';
import { mapCategoryDtoToDomain } from '../mappers/category.mapper';

import { Client } from '../../../../shared/api/nswag/api-client';

@Injectable()
export class CategoriesNswagRepository implements CategoriesRepository {
    private readonly api = inject(Client);

    getAll(): Observable<Category[]> {
        return this.api.getCategories().pipe(
            map(dtos => dtos.map(mapCategoryDtoToDomain)),
        );
    }
}
