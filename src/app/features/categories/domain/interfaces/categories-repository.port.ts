import { Observable } from 'rxjs';
import { Category } from '../model/category';

export abstract class CategoriesRepository {
    abstract getAll(): Observable<Category[]>;
}