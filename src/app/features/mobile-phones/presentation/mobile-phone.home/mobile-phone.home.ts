import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { StorePhoneCard } from '../../../../shared/presentation/store-phone-card/store-phone-card';
import { CatalogFeedback } from '../catalog-feedback/catalog-feedback';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { MobilePhonesBrand } from '../../domain/model/mobile-phones-brand';

@Component({
  selector: 'app-mobile-phone-home',
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    DecimalPipe,
    StorePhoneCard,
    CatalogFeedback,
  ],
  templateUrl: './mobile-phone.home.html',
  styleUrl: './mobile-phone.home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneHome implements OnInit {
  private readonly facade = inject(MobilePhonesFacade);
  private readonly users = inject(UsersFacade);
  private readonly orders = inject(OrdersFacade);
  readonly customer = inject(CustomerContext);
  readonly status = toSignal(this.facade.topStatus$, { initialValue: 'idle' });
  private readonly rawPhones = toSignal(this.facade.top$, { initialValue: [] });
  readonly brands = [
    MobilePhonesBrand.Apple,
    MobilePhonesBrand.Samsung,
    MobilePhonesBrand.Xiaomi,
    MobilePhonesBrand.Motorola,
  ];
  protected readonly failedHeroPhotos = signal<Set<string>>(new Set());
  readonly phones = computed<MobilePhone[]>(() => {
    const clientId = this.customer.clientId()?.toLowerCase();
    const saved = new Set(
      clientId
        ? this.users
            .favorites()
            .filter((item) => item.clientId?.toLowerCase() === clientId)
            .map((item) => item.productId?.toLowerCase())
        : [],
    );
    return this.rawPhones().map((phone) => ({
      id: phone.id,
      name: phone.commonDescription?.name ?? 'Unknown model',
      brand: phone.commonDescription?.brand,
      mainPhoto: phone.commonDescription?.mainPhoto ?? null,
      price: phone.price,
      isFavorite: saved.has(phone.id.toLowerCase()),
    }));
  });
  readonly heroPhones = computed(() =>
    this.status() === 'loaded' ? this.phones().slice(0, 2) : [],
  );

  ngOnInit(): void {
    const clientId = this.customer.clientId();
    if (clientId) this.users.loadFavorites(clientId);
    this.load();
  }

  load(): void {
    this.failedHeroPhotos.set(new Set());
    this.facade.loadTop();
  }

  heroPhotoFailed(id: string): void {
    this.failedHeroPhotos.update((previous) => new Set([...previous, id]));
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
