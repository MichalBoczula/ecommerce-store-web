import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorefrontLayoutState {
  readonly mobileActionBarVisible = signal(false);
}
