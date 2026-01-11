import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-mobile-phone-list',
  imports: [MatGridListModule, AsyncPipe],
  templateUrl: './mobile-phone.container.html',
  styleUrl: './mobile-phone.container.scss',
  standalone: true
})
export class MobilePhoneList {
  private bo = inject(BreakpointObserver);

  readonly isMobile$ = this.bo.observe([Breakpoints.Handset]).pipe(
    map(r => r.matches),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
