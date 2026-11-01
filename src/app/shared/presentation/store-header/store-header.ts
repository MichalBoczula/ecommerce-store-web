import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-store-header',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './store-header.html',
  styleUrl: './store-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreHeader {
  readonly cartCount = input(0);
  readonly favoritesCount = input(0);
  readonly filtersOpen = input(false);
  readonly openFilters = output<void>();
}
