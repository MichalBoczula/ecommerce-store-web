import { StorefrontLayoutState } from '../../../../shared/presentation/storefront-layout-state';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { DecimalPipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { CatalogFeedback } from '../catalog-feedback/catalog-feedback';
import {
  asLines,
  isNotNullOrWhiteSpace,
  toDescriptions,
  toGalleryPhotos,
  toGlanceRows,
  toProductName,
  toSpecRows,
  withUnit,
} from './mobile-phone.details.utils';

@Component({
  selector: 'app-mobile-phone-details',
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatIconModule, CatalogFeedback],
  templateUrl: './mobile-phone.details.html',
  styleUrl: './mobile-phone.details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MobilePhonesFacade);
  private readonly orders = inject(OrdersFacade);
  private readonly users = inject(UsersFacade);
  private readonly location = inject(Location);
  readonly customer = inject(CustomerContext);
  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );
  readonly status = toSignal(this.facade.detailsStatus$, { initialValue: 'idle' });
  private readonly rawDetails = toSignal(this.facade.details$, { initialValue: null });
  readonly details = computed(() => {
    const item = this.rawDetails();
    return this.status() === 'loaded' && item?.id.toLowerCase() === this.routeId().toLowerCase()
      ? item
      : null;
  });
  readonly feedbackStatus = computed(() =>
    !this.routeId() || (this.status() === 'loaded' && !this.details()) ? 'error' : this.status(),
  );
  readonly productName = computed(() =>
    this.details() ? toProductName(this.details()!) : 'Mobile phone',
  );
  readonly specRows = computed(() => (this.details() ? toSpecRows(this.details()!) : []));
  readonly glanceRows = computed(() => (this.details() ? toGlanceRows(this.details()!) : []));
  readonly descriptions = computed(() =>
    this.details() ? toDescriptions(this.details()!).filter(isNotNullOrWhiteSpace) : [],
  );
  readonly photos = computed(() => (this.details() ? toGalleryPhotos(this.details()!) : []));
  readonly selectedPhoto = signal<string | null>(null);
  readonly failedPhotos = signal<Set<string>>(new Set());
  readonly activePhoto = computed(() => {
    const available = this.photos().filter((photo) => !this.failedPhotos().has(photo));
    return available.find((photo) => photo === this.selectedPhoto()) ?? available[0] ?? null;
  });
  readonly isFavorite = computed(() => {
    const id = this.details()?.id.toLowerCase();
    const clientId = this.customer.clientId()?.toLowerCase();
    return (
      !!id &&
      !!clientId &&
      this.users
        .favorites()
        .some(
          (favorite) =>
            favorite.clientId?.toLowerCase() === clientId &&
            favorite.productId?.toLowerCase() === id,
        )
    );
  });
  readonly hasPrice = computed(() => {
    const price = this.details()?.price;
    return (
      typeof price?.amount === 'number' && Number.isFinite(price.amount) && !!price.currency?.trim()
    );
  });
  readonly storage = computed(() => withUnit(this.details()?.electronicDetails?.storage, 'GB'));
  readonly summary = computed(() =>
    [this.details()?.electronicDetails?.cpu, this.details()?.electronicDetails?.displayType]
      .filter(isNotNullOrWhiteSpace)
      .join(' · '),
  );
  readonly asLines = asLines;

  constructor() {
    const layout = inject(StorefrontLayoutState);
    effect((onCleanup) => {
      layout.mobileActionBarVisible.set(!!this.details());
      onCleanup(() => layout.mobileActionBarVisible.set(false));
    });
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((id) => this.load(id));
    const clientId = this.customer.clientId();
    if (clientId) this.users.loadFavorites(clientId);
  }

  load(id = this.routeId()): void {
    this.selectedPhoto.set(null);
    this.failedPhotos.set(new Set());
    if (id) this.facade.loadById(id);
  }

  selectPhoto(photo: string): void {
    if (this.photos().includes(photo) && !this.failedPhotos().has(photo))
      this.selectedPhoto.set(photo);
  }

  photoFailed(photo: string): void {
    this.failedPhotos.update((photos) => new Set([...photos, photo]));
  }

  addToCart(): void {
    const item = this.details(),
      clientId = this.customer.clientId();
    if (item?.id && clientId) this.orders.addItem(clientId, { productId: item.id, quantity: 1 });
  }

  toggleFavorite(): void {
    const item = this.details(),
      clientId = this.customer.clientId();
    if (!item?.id || !clientId) return;
    if (this.isFavorite()) this.users.removeFavorite(clientId, item.id);
    else this.users.addFavoriteByProductId(clientId, item.id);
  }

  goBack(): void {
    this.location.back();
  }
}
