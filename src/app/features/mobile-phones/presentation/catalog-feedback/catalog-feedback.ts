import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LoadStatus } from '../../state/mobile-phones.feature';

@Component({
  selector: 'app-catalog-feedback',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './catalog-feedback.html',
  styleUrl: './catalog-feedback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFeedback {
  readonly status = input.required<LoadStatus>();
  readonly canEditFilters = input(false);
  readonly retry = output<void>();
  readonly editFilters = output<void>();
  readonly skeletons = [0, 1, 2];
}
