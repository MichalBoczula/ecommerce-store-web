import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-phone-home',
  imports: [RouterLink, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './mobile-phone.home.html',
  styleUrl: './mobile-phone.home.scss',
})
export class MobilePhoneHome implements OnInit {
  private readonly facade = inject(MobilePhonesFacade);
  readonly top$ = this.facade.top$;

  ngOnInit(): void {
    this.facade.loadTop();
  }
}
