import { Observable } from 'rxjs';
import { Favorite } from '../model/favorite-response.model';
import { AddFavoriteCommand } from '../model/add-favorite-command.model';

export abstract class FavoritesRepository {
    abstract addFavorite(command: AddFavoriteCommand): Observable<Favorite>;
}