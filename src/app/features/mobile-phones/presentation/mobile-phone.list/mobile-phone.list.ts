import { CustomerContext } from '../../../../shared/application/customer-context';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { StorePhoneCard } from '../../../../shared/presentation/store-phone-card/store-phone-card';
import { MobilePhoneFilter } from '../mobile-phone.filter/mobile-phone.filter';
import { CatalogFeedback } from '../catalog-feedback/catalog-feedback';
import { CatalogFilterDrawer } from '../mobile-phone.filter/catalog-filter-drawer';
import { hasCatalogFilter, readCatalogFilter } from '../mobile-phone.filter/catalog-filter-query';

@Component({
  selector: 'app-mobile-phone-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    StorePhoneCard,
    MobilePhoneFilter,
    CatalogFeedback,
  ],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneList {
  private readonly facade = inject(MobilePhonesFacade);
  private readonly orders = inject(OrdersFacade);
  private readonly users = inject(UsersFacade);
  private readonly route = inject(ActivatedRoute);
  readonly drawer = inject(CatalogFilterDrawer);
  readonly customer = inject(CustomerContext);
  readonly status = toSignal(this.facade.catalogStatus$, { initialValue: 'idle' });
  private readonly rawPhones = toSignal(this.facade.items$, { initialValue: [] });
  readonly filter = toSignal(this.route.queryParamMap.pipe(map(readCatalogFilter)), {
    initialValue: readCatalogFilter(this.route.snapshot.queryParamMap),
  });
  readonly filtered = computed(() => hasCatalogFilter(this.filter()));
  readonly phones = computed<MobilePhone[]>(() => {
    const clientId = this.customer.clientId()?.toLowerCase();
    const favorites = new Set(
      clientId
        ? this.users
            .favorites()
            .filter((item) => item.clientId?.toLowerCase() === clientId)
            .map((item) => item.productId?.toLowerCase())
        : [],
    );
    return this.rawPhones().map((phone) => ({
      ...phone,
      isFavorite: favorites.has(phone.id.toLowerCase()),
    }));
  });
  readonly currencies = computed(() =>
    [
      ...new Set(
        this.phones()
          .map((phone) => phone.price?.currency)
          .filter(Boolean),
      ),
    ].join(', '),
  );

  constructor() {
    const clientId = this.customer.clientId();
    if (clientId) this.users.loadFavorites(clientId);
    this.route.queryParamMap
      .pipe(
        map(readCatalogFilter),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(),
      )
      .subscribe((filter) => this.load(filter));
  }

  load(filter = this.filter()): void {
    if (hasCatalogFilter(filter)) this.facade.loadByFilter(filter);
    else this.facade.load(15);
  }

  specifications(phone: MobilePhone): string {
    return [phone.screenSizeInches ? `${phone.screenSizeInches}″` : null, phone.displayType]
      .filter(Boolean)
      .join(' · ');
  }

  addToCart(phone: MobilePhone): void {
    const clientId = this.customer.clientId();
    if (clientId && phone.id) this.orders.addItem(clientId, { productId: phone.id, quantity: 1 });
  }

  toggleFavorite(phone: MobilePhone): void {
    const clientId = this.customer.clientId();
    if (!clientId || !phone.id) return;
    if (phone.isFavorite) this.users.removeFavorite(clientId, phone.id);
    else this.users.addFavoriteByProductId(clientId, phone.id);
  }
}
