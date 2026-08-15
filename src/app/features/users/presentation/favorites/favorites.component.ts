import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UsersFacade } from '../../application/users.facade';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
    ],
    templateUrl: './favorites.component.html',
    styleUrl: './favorites.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
    private readonly usersFacade = inject(UsersFacade);
    private readonly location = inject(Location);

    private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    readonly displayedColumns: string[] = ['productId', 'addedAt', 'actions'];

    readonly favoritesList = this.usersFacade.favorites;
    readonly status = this.usersFacade.status;
    readonly error = this.usersFacade.error;

    readonly totalItems = computed(() => this.favoritesList().length);

    removeFavorite(productId: string): void {
        if (!productId) return;
    }

    clearAllFavorites(): void {
    }

    goBack(): void {
        this.location.back();
    }
}