import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogFilterDrawer {
  private readonly requests = new Subject<void>();
  readonly openRequested$ = this.requests.asObservable();

  requestOpen(): void {
    this.requests.next();
  }
}
