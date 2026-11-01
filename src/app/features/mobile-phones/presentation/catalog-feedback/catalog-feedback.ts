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
  readonly loadingLabel = input('Loading smartphones');
  readonly errorTitle = input('Couldn’t load phones');
  readonly errorDescription = input('The catalog is unavailable right now. Try loading it again.');
  readonly canEditFilters = input(false);
  readonly headingLevel = input<2 | 3>(3);
  readonly retry = output<void>();
  readonly editFilters = output<void>();
  readonly skeletons = [0, 1, 2];
}
