import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

@Component({
  selector: 'app-mobile-phone-home',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './mobile-phone.home.html',
  styleUrl: './mobile-phone.home.scss',
})
export class MobilePhoneHome {
  private readonly facade = inject(MobilePhonesFacade);


}
