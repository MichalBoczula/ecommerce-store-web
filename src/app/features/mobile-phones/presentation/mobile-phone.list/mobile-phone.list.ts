import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { CommonModule } from '@angular/common';
import { MobilePhoneDto } from '../../../../shared/api/nswag/api-client';
import { Router } from '@angular/router';

const MOCK_PHONES: MobilePhoneDto[] = [
  { id: '1', name: 'iPhone 15', price: 4999 } as any,
  { id: '2', name: 'Galaxy S24', price: 4299 } as any,
];

@Component({
  selector: 'app-mobile-phone-list',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, CommonModule],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
  // providers: [
  //   {
  //     provide: MobilePhonesFacade,
  //     useValue: {
  //       items$: of(MOCK_PHONES),
  //       status$: of('loaded'),
  //       error$: of(null),
  //       load: (_amount: number) => { },
  //     } satisfies Partial<MobilePhonesFacade>,
  //   },
  // ],
})
export class MobilePhoneList {
  private readonly facade = inject(MobilePhonesFacade);
  private readonly router = inject(Router);

  readonly phones$ = this.facade.items$;

  ngOnInit(): void {
    this.facade.load(15);
  }

  addToCart(_t3: MobilePhoneDto) {
    throw new Error('Method not implemented.');
  }

  toggleFavorite(_t3: MobilePhoneDto) {
    throw new Error('Method not implemented.');
  }

  openDetails(phoneId: string) {
    this.router.navigate(['/details', phoneId])
  }
}