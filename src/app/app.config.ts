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

// Users / Favorites Feature
import { FavoritesRepository } from './features/users/domain/interfaces/favorites-repository.port';
import { FavoritesKiotaRepository } from './features/users/infrastructure/api/favorites-kiota-repository';
import { UsersFacade } from './features/users/application/users.facade';
import { favoritesFeature } from './features/users/state/users.feature';
import { FavoritesEffects } from './features/users/state/users.effects';
import { OrderHistoryRepository } from './features/orders/domain/interfaces/order-history-repository.port';
import { OrderHistoryKiotaRepository } from './features/orders/infrastructure/api/order-history-kiota-repository';
import { OrderHistoryFacade } from './features/orders/application/order-history.facade';
import { orderHistoryFeature } from './features/orders/state/order-history.feature';
import { OrderHistoryEffects } from './features/orders/state/order-history.effects';
import { CustomerProfileRepository } from './features/users/domain/interfaces/customer-profile-repository.port';
import { CustomerProfileKiotaRepository } from './features/users/infrastructure/api/customer-profile-kiota-repository';
import { CustomerProfileFacade } from './features/users/application/customer-profile.facade';
import { customerProfileFeature } from './features/users/state/customer-profile.feature';
import { CustomerProfileEffects } from './features/users/state/customer-profile.effects';
import { PaymentsRepository } from './features/payments/domain/interfaces/payments-repository.port';
import { PaymentsKiotaRepository } from './features/payments/infrastructure/api/payments-kiota-repository';
import { PaymentsFacade } from './features/payments/application/payments.facade';
import { paymentsFeature } from './features/payments/state/payments.feature';
import { PaymentsEffects } from './features/payments/state/payments.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideStore(),

    provideState(mobilePhonesFeature),
    provideState(cartFeature),
    provideState(favoritesFeature),
    provideState(orderHistoryFeature),
    provideState(customerProfileFeature),
    provideState(paymentsFeature),
    provideEffects(MobilePhonesEffects, OrdersEffects, FavoritesEffects, OrderHistoryEffects, CustomerProfileEffects, PaymentsEffects),

    // Mobile Phones Providers
    { provide: MobilePhonesRepository, useClass: MobilePhonesKiotaRepository },
    MobilePhonesFacade,

    // Cart / Orders Providers
    { provide: OrdersRepository, useClass: OrdersKiotaRepository },
    OrdersFacade,

    // Order history is read from Invoice snapshots, independently of current catalog prices.
    { provide: OrderHistoryRepository, useClass: OrderHistoryKiotaRepository },
    OrderHistoryFacade,
    { provide: CustomerProfileRepository, useClass: CustomerProfileKiotaRepository },
    CustomerProfileFacade,
    { provide: PaymentsRepository, useClass: PaymentsKiotaRepository },
    PaymentsFacade,

    // Users / Favorites Providers
    { provide: FavoritesRepository, useClass: FavoritesKiotaRepository },
    UsersFacade,

    // Store Devtools
    ...(isDevMode() ? [provideStoreDevtools({ maxAge: 50 })] : []),
  ],
};
