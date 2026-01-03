import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CategoriesFacade } from '../../application/facades/categories.facade';

@Component({
    standalone: true,
    selector: 'app-categories-page',
    imports: [AsyncPipe, MatListModule, MatProgressBarModule],
    template: `
    <h2>Categories</h2>

    @if ((facade.status$ | async) === 'loading') {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <mat-list>
      @for (c of (facade.items$ | async) ?? []; track c.id) {
        <mat-list-item>
          <div matListItemTitle>{{ c.name }}</div>
          <div matListItemLine>{{ c.code }} • Active: {{ c.isActive }}</div>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class CategoriesPage {
    readonly facade = inject(CategoriesFacade);

    constructor() {
        this.facade.load();
    }
}
