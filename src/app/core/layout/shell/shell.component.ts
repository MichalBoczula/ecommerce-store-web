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
        RouterOutlet, RouterLink, RouterLinkActive,
        MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule,
    ],
    template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        #sidenav
        class="sidenav"
        [mode]="sidenavMode()"
        [opened]="sidenavOpened()"
        [fixedInViewport]="isHandset()"
        fixedTopGap="64"
      >
        <div class="brand">
          <mat-icon>store</mat-icon>
          <span>eCommerce</span>
        </div>

        <mat-divider></mat-divider>

        <mat-nav-list>
          @for (item of navItems(); track item.link) {
            <a
              mat-list-item
              [routerLink]="item.link"
              routerLinkActive="active"
              (click)="onNavClick(sidenav)"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle menu">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="title">ECommerce Store</span>
          <span class="spacer"></span>

          <button mat-icon-button aria-label="Cart">
            <mat-icon>shopping_cart</mat-icon>
          </button>
          <button mat-icon-button aria-label="Account">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
    styles: [`
    .shell { height: 100vh; }
    .toolbar { position: sticky; top: 0; z-index: 10; }
    .title { margin-left: 8px; font-weight: 600; }
    .spacer { flex: 1; }
    .content { padding: 16px; }

    .sidenav { width: 280px; }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      font-weight: 700;
    }

    a.active {
      background: rgba(0,0,0,0.06);
      border-radius: 8px;
      margin: 4px 8px;
    }
  `],
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
