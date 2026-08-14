import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { OrdersFacade } from '../../../cart/application/orders.facade';
import { ShoppingCartLineRequest } from '../../../cart/domain/model/update-shopping-cart/shopping-cart-line-request.model';
import {
  asLines,
  isNotNullOrWhiteSpace,
  toDescriptions,
  toProductName,
  toSpecRows,
} from './mobile-phone.details.utils';

export type SpecRow =
  | { label: string; kind: 'text'; value: string | string[] }
  | { label: string; kind: 'bool'; value: boolean };

@Component({
  selector: 'app-mobile-phone-details',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCheckboxModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mobile-phone.details.html',
  styleUrl: './mobile-phone.details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MobilePhonesFacade);
  private readonly ordersFacade = inject(OrdersFacade);

  // Client ID for the shopping cart session
  private readonly userId: string = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  readonly details = toSignal(this.facade.details$);

  readonly productName = computed(() => {
    const item = this.details();
    return item ? toProductName(item) : '';
  });

  readonly specRows = computed(() => {
    const item = this.details();
    return item ? toSpecRows(item) : [];
  });

  readonly descriptions = computed(() => {
    const item = this.details();
    return item ? toDescriptions(item) : [];
  });

  readonly asLines = asLines;
  readonly isNotNullOrWhiteSpace = isNotNullOrWhiteSpace;
  readonly displayedColumns: string[] = ['label', 'value'];

  readonly images: string[] = [
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
    'https://material.angular.dev/assets/img/examples/shiba1.jpg',
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id) {
      this.facade.loadById(id);
    }
  }

  addToCart(): void {
    const item = this.details();
    if (!item || !item.id) return;

    const lineItem: ShoppingCartLineRequest = {
      productId: item.id,
      name: item.commonDescription?.name ?? 'Unknown Phone',
      brand: item.commonDescription?.brand ?? null,
      unitPriceAmount: Number(item.price?.amount) || 0,
      unitPriceCurrency: 'USD',
      quantity: 1,
    };

    this.ordersFacade.addItem(this.userId, lineItem);
  }

  toggleFavorite(): void {
    const item = this.details();
    if (!item?.id) return;
    console.log('Toggle favorite for:', item.id);
  }
}