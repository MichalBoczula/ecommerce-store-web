import { Component, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints, } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const DESKTOP = '(min-width: 1300px)';

@Component({
  selector: 'app-mobile-phone-list',
  imports: [MatGridListModule, MatCardModule, MatButtonModule],
  templateUrl: './mobile-phone.list.html',
  styleUrl: './mobile-phone.list.scss',
})
export class MobilePhoneList {
  cards = [1, 2, 3, 4, 5, 6, 7];
  private bp = inject(BreakpointObserver);

  private layout = toSignal(
    this.bp.observe([Breakpoints.Handset, DESKTOP]).pipe(
      map(state => state.breakpoints[DESKTOP]
        ? { col: 4, height: '320px' }
        : { col: 2, height: '320px' }
      )
    ),
    { initialValue: { col: 2, height: '320px' } }
  );

  cols = () => this.layout().col;
  rowHeight = () => this.layout().height;
}