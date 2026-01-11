import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

type NavItem = { label: string; icon: string; link: string };

@Component({
  selector: 'app-mobile-phone-list',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule],
  templateUrl: './mobile-phone.container.html',
  styleUrl: './mobile-phone.container.scss',
  standalone: true
})
export class MobilePhoneList {
  private readonly breakpoints = inject(BreakpointObserver);

  private readonly handsetMatch = signal(false);

  constructor() {
    this.breakpoints.observe([Breakpoints.Handset]).subscribe(r => {
      this.handsetMatch.set(r.matches);
    });
  }

  readonly isHandset = computed(() => this.handsetMatch());

  readonly sidenavMode = computed<'over' | 'side'>(() => (this.isHandset() ? 'over' : 'side'));
  readonly sidenavOpened = computed(() => !this.isHandset());

  readonly navItems = signal<NavItem[]>([
    { label: 'Home', icon: 'home', link: '/' },
    { label: 'Products', icon: 'inventory_2', link: '/products' },
    { label: 'Categories', icon: 'category', link: '/categories' },
    { label: 'Orders', icon: 'receipt_long', link: '/orders' },
  ]);

  onNavClick(sidenav: { close: () => void }) {
    if (this.isHandset()) sidenav.close();
  }
}
