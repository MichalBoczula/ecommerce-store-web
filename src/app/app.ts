import { Component, computed, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { MobilePhoneContainer } from "./features/mobile-phones/presentation/mobile-phone.container/mobile-phone.container";

type NavItem = { label: string; icon: string; link: string };

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, RouterOutlet, MobilePhoneContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ecommerce-store-web');
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
