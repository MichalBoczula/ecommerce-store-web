import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';

// Mobile Phones Feature
import { MobilePhonesRepository } from './features/mobile-phones/domain/interfaces/mobile-phones-repository.port';
import { MobilePhonesFacade } from './features/mobile-phones/application/mobile-phones.facade';
import { mobilePhonesFeature } from './features/mobile-phones/state/mobile-phones.feature';
import { MobilePhonesEffects } from './features/mobile-phones/state/mobile-phones-effects';
import { MobilePhonesKiotaRepository } from './features/mobile-phones/infrastructure/api/mobile-phones-kiota-repository';

// Cart / Orders Feature
import { OrdersRepository } from './features/cart/domain/interfaces/orders-repository.port';
import { OrdersKiotaRepository } from './features/cart/infrastructure/api/orders-kiota-repository';
import { OrdersFacade } from './features/cart/application/orders.facade';
import { cartFeature } from './features/cart/state/orders.feature';
import { OrdersEffects } from './features/cart/state/orders.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideStore(),

    // Feature State & Effects
    provideState(mobilePhonesFeature),
    provideState(cartFeature),
    provideEffects(MobilePhonesEffects, OrdersEffects),

    // Mobile Phones Providers
    { provide: MobilePhonesRepository, useClass: MobilePhonesKiotaRepository },
    MobilePhonesFacade,

    // Cart / Orders Providers (Dependency Inversion Binding)
    { provide: OrdersRepository, useClass: OrdersKiotaRepository },
    OrdersFacade,

    // Store Devtools (Conditional array spread)
    ...(isDevMode() ? [provideStoreDevtools({ maxAge: 50 })] : []),
  ],
};