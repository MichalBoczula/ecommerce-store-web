import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

type NavItem = { label: string; icon: string; link: string };

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
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
