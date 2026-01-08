import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';

import { mobilePhonesFeature } from '../../state/mobile-phones.feature';
import * as MobilePhonesActions from '../../state/mobile-phones.actions';

@Component({
    standalone: true,
    selector: 'app-mobile-phones-page',
    imports: [AsyncPipe, MatListModule, MatProgressBarModule],
    template: `
    <h2>Mobile Phones</h2>

    @if ((status$ | async) === 'loading') {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <mat-list>
      @for (phone of (items$ | async) ?? []; track phone.id) {
        <mat-list-item>
          <div matListItemTitle>{{ phone.commonDescription.name ?? 'Unnamed phone' }}</div>
          <div matListItemLine>
            {{ phone.commonDescription.description ?? 'No description available.' }}
          </div>
        </mat-list-item>
      }
    </mat-list>
  `,
})
export class MobilePhonesPage {
    private readonly store = inject(Store);

    readonly status$ = this.store.select(mobilePhonesFeature.selectStatus);
    readonly items$ = this.store.select(mobilePhonesFeature.selectItems);

    constructor() {
        this.store.dispatch(MobilePhonesActions.loadMobilePhones({ amount: 12 }));
    }
}
