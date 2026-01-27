import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { API_BASE_URL, Client } from './shared/api/nswag/api-client';
import { environment } from '../environments/environment';
import { currenciesFeature } from './features/currencies/state/currencies.feature';
import { CurrenciesEffects } from './features/currencies/state/currencies.effects';
import { CurrenciesNswagRepository } from './features/currencies/infrastructure/api/currencies-nswag.repository';
import { CurrencyRepository } from './features/currencies/domain/interfaces/currency.repository';
import { MobilePhonesRepository } from './features/mobile-phones/domain/interfaces/mobile-phones-repository.port';
import { MobilePhonesNswagRepository } from './features/mobile-phones/infrastructure/api/mobile-phones-nswag.repository';
import { MobilePhonesFacade } from './features/mobile-phones/application/mobile-phones.facade';
import { mobilePhonesFeature } from './features/mobile-phones/state/mobile-phones.feature';
import { MobilePhonesEffects } from './features/mobile-phones/state/mobile-phones-effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideStore(),
    provideEffects(),
    provideState(currenciesFeature),
    { provide: CurrencyRepository, useClass: CurrenciesNswagRepository },
    provideEffects(CurrenciesEffects),
    { provide: MobilePhonesRepository, useClass: MobilePhonesNswagRepository },
    MobilePhonesFacade,
    provideState(mobilePhonesFeature),
    provideEffects(MobilePhonesEffects),
    isDevMode() ? provideStoreDevtools({ maxAge: 50 }) : [],
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    Client,
  ],
};
