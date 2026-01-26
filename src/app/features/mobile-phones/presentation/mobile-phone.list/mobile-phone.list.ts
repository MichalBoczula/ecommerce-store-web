import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { Observable } from 'rxjs';
import { MobilePhone } from '../../domain/model/mobile-phone';
import { CommonModule } from '@angular/common';
import { MobilePhoneDto } from '../../../../shared/api/nswag/api-client';

@Component({
  selector: 'app-mobile-phone-list',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, CommonModule],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
})
export class MobilePhoneList {
  private readonly facade = inject(MobilePhonesFacade);

  readonly phones$: Observable<MobilePhone[]> = this.facade.getAll(7);

  addToCart(_t3: MobilePhoneDto) {
    throw new Error('Method not implemented.');
  }

  toggleFavorite(_t3: MobilePhoneDto) {
    throw new Error('Method not implemented.');
  }

}