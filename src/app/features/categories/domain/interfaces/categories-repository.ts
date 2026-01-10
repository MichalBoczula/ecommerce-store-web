import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

export abstract class CategoriesRepository {
    abstract getAll(): Observable<Category[]>;
}