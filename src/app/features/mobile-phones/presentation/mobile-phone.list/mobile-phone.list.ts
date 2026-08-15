import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { UsersFacade } from '../../../users/application/users.facade';
import { MobilePhoneDto } from '../../infrastructure/api-clients/products/models';
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

  readonly phones$ = this.facade.items$;

  ngOnInit(): void {
    this.facade.load(15);
  }

  addToCart(phone: MobilePhoneDto, event: MouseEvent): void {
    event.stopPropagation();

    if (!phone.id) return;

    const lineItem: ShoppingCartLineRequest = {
      productId: phone.id,
      name: phone.name ?? 'Unknown Phone',
      brand: phone.brand ?? null,
      unitPriceAmount: phone.price?.amount ?? 0,
      unitPriceCurrency: phone.price?.currency ?? 'USD',
      quantity: 1,
    };

    this.ordersFacade.addItem(this.userId, lineItem);
  }

  toggleFavorite(phone: MobilePhoneDto, event: MouseEvent): void {
    event.stopPropagation();

    if (!phone.id) return;

    this.usersFacade.addFavoriteByProductId(this.userId, phone.id);
  }

  isFavorite(phoneId?: string | null): boolean {
    if (!phoneId) return false;
    return this.usersFacade.isProductFavorite(phoneId);
  }

  openDetails(phoneId: string): void {
    this.router.navigate(['/details', phoneId]);
  }
}