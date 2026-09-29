import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { ShoppingCartLineRequest } from '../../../cart/domain/model/update-shopping-cart/shopping-cart-line-request.model';
@Component({
  selector: 'app-mobile-phone-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneList implements OnInit {
  private readonly facade = inject(MobilePhonesFacade);
  private readonly ordersFacade = inject(OrdersFacade);
  private readonly usersFacade = inject(UsersFacade);
  private readonly router = inject(Router);

  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  private readonly rawPhones = toSignal(this.facade.items$, { initialValue: [] });

  private readonly favorites = this.usersFacade.favorites;

  readonly phones = computed<MobilePhone[]>(() => {
    const phones = this.rawPhones() ?? [];
    const favs = this.favorites() ?? [];

    const favoriteIds = new Set(
      favs.map(f => f.productId?.toString().toLowerCase()).filter(Boolean)
    );

    return phones.map(phone => {
      const isFavorite = !!phone.id && favoriteIds.has(phone.id.toLowerCase());
      return { ...phone, isFavorite };
    });
  });

  ngOnInit(): void {
    this.facade.load(15);
    this.usersFacade.loadFavorites(this.userId);
  }

  addToCart(phone: MobilePhone, event: MouseEvent): void {
    event.stopPropagation();
    if (!phone.id) return;

    const lineItem: ShoppingCartLineRequest = {
      productId: phone.id,
      quantity: 1,
    };

    this.ordersFacade.addItem(this.userId, lineItem);
  }

  toggleFavorite(phone: MobilePhone, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!phone.id) return;

    if (phone.isFavorite) {
      this.usersFacade.removeFavorite(this.userId, phone.id);
    } else {
      this.usersFacade.addFavoriteByProductId(this.userId, phone.id);
    }
  }

  openDetails(phoneId: string): void {
    this.router.navigate(['/details', phoneId]);
  }

}
