import { Component, computed, inject } from '@angular/core';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MobilePhoneFilter } from "../mobile-phone.filter/mobile-phone.filter";
import { Router, RouterOutlet } from "@angular/router";
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';

@Component({
  selector: 'app-mobile-phone-container',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MobilePhoneFilter,
    RouterOutlet
  ],
  templateUrl: './mobile-phone.container.html',
  styleUrl: './mobile-phone.container.scss',
  standalone: true
})
export class MobilePhoneContainer {
  readonly sidenavMode = computed<'over'>(() => 'over');
  readonly sidenavOpened = computed(() => false);
  private readonly router = inject(Router);

  onNavClick(sidenav: { close: () => void }) {
    sidenav.close();
  }

  onCartClick(): void {
    this.router.navigate(['/cart']);
  }
}
