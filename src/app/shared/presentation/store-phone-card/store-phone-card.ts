import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-store-phone-card',
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './store-phone-card.html',
  styleUrl: './store-phone-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePhoneCard {
  readonly productId = input.required<string>();
  readonly name = input.required<string>();
  readonly brand = input<string | null>();
  readonly photo = input<string | null>();
  readonly specifications = input<string | null>();
  readonly price = input<{ amount?: number | null; currency?: string | null } | null>();
  readonly saved = input(false);
  readonly actionsDisabled = input(false);
  readonly addToCart = output<void>();
  readonly toggleFavorite = output<void>();
  protected readonly failedPhoto = signal<string | null | undefined>(undefined);
  protected readonly showPhoto = computed(
    () => !!this.photo() && this.failedPhoto() !== this.photo(),
  );
  protected readonly hasPrice = computed(() => {
    const price = this.price();
    return (
      typeof price?.amount === 'number' && Number.isFinite(price.amount) && !!price.currency?.trim()
    );
  });
}
