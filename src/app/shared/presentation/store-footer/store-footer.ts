import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-store-footer',
  imports: [RouterLink],
  templateUrl: './store-footer.html',
  styleUrl: './store-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFooter {
  readonly year = new Date().getFullYear();
}
