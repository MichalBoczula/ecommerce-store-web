import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mobile-phone-list',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
})
export class MobilePhoneList {
  cards = [1, 2, 3, 4, 5, 6, 7];

}