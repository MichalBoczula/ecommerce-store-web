import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-phone-home',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './mobile-phone.home.html',
  styleUrl: './mobile-phone.home.scss',
})
export class MobilePhoneHome {

}
