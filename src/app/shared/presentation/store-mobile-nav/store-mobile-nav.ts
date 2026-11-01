import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-store-mobile-nav',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatBadgeModule],
  templateUrl: './store-mobile-nav.html',
  styleUrl: './store-mobile-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreMobileNav {
  readonly cartCount = input(0);
  readonly favoritesCount = input(0);
}
