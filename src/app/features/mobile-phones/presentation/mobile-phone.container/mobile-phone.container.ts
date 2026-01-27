import { Component, computed } from '@angular/core';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MobilePhoneList } from "../mobile-phone.list/mobile-phone.list";
import { MobilePhoneFilter } from "../mobile-phone.filter/mobile-phone.filter";
import { MobilePhoneDetails } from "../mobile-phone.details/mobile-phone.details";

@Component({
  selector: 'app-mobile-phone-container',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MobilePhoneList,
    MobilePhoneFilter,
    MobilePhoneDetails
  ],
  templateUrl: './mobile-phone.container.html',
  styleUrl: './mobile-phone.container.scss',
  standalone: true
})
export class MobilePhoneContainer {
  readonly sidenavMode = computed<'over'>(() => 'over');
  readonly sidenavOpened = computed(() => false);

  onNavClick(sidenav: { close: () => void }) {
    sidenav.close();
  }
}
