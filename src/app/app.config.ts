import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { MobilePhonesRepository } from './features/mobile-phones/domain/interfaces/mobile-phones-repository.port';
import { MobilePhonesFacade } from './features/mobile-phones/application/mobile-phones.facade';
import { mobilePhonesFeature } from './features/mobile-phones/state/mobile-phones.feature';
import { MobilePhonesEffects } from './features/mobile-phones/state/mobile-phones-effects';
import { MobilePhonesKiotaRepository } from './features/mobile-phones/infrastructure/api/mobile-phones-kiota-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideStore(),
    { provide: MobilePhonesRepository, useClass: MobilePhonesKiotaRepository },
    MobilePhonesFacade,
    provideState(mobilePhonesFeature),
    provideEffects(MobilePhonesEffects),
    isDevMode() ? provideStoreDevtools({ maxAge: 50 }) : [],
  ],
};