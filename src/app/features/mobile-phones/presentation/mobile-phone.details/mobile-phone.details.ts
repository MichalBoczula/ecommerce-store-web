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
}