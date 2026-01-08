import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { mobilePhonesFeature } from '../state/mobile-phones.feature';
import { MobilePhonesEffects } from '../state/mobile-phones-effects';
import { MobilePhonesRepository } from '../domain/ports/mobile-phones-repository.port';
import { MobilePhonesNswagRepository } from '../infrastructure/api/mobile-phones-nswag.repository';

export const MOBILE_PHONES_ROUTES: Routes = [
    {
        path: '',
        providers: [
            provideState(mobilePhonesFeature),
            provideEffects([MobilePhonesEffects]),
            { provide: MobilePhonesRepository, useClass: MobilePhonesNswagRepository },
        ],
        loadComponent: () =>
            import('./pages/mobile-phones.page').then(m => m.MobilePhonesPage),
    },
];
