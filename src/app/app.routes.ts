import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    title: 'Home | eCommerce',
    loadComponent: () =>
      import('./features/mobile-phones/presentation/mobile-phone.home/mobile-phone.home').then(
        (m) => m.MobilePhoneHome,
      ),
  },
  {
    path: 'list',
    title: 'Smartphones | eCommerce',
    loadComponent: () =>
      import('./features/mobile-phones/presentation/mobile-phone.list/mobile-phone.list').then(
        (m) => m.MobilePhoneList,
      ),
  },
  {
    path: 'details/:id',
    title: 'Phone details | eCommerce',
    loadComponent: () =>
      import('./features/mobile-phones/presentation/mobile-phone.details/mobile-phone.details').then(
        (m) => m.MobilePhoneDetails,
      ),
  },
  {
    path: 'cart',
    title: 'Your cart | eCommerce',
    loadComponent: () =>
      import('./features/cart/presentation/shopping-cart/shopping-cart').then(
        (m) => m.ShoppingCartComponent,
      ),
  },
  {
    path: 'favorites',
    title: 'Saved phones | eCommerce',
    loadComponent: () =>
      import('./features/users/presentation/favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: 'profile',
    title: 'Your profile | eCommerce',
    loadComponent: () =>
      import('./features/users/presentation/customer-profile/customer-profile').then(
        (m) => m.CustomerProfileComponent,
      ),
  },
  {
    path: 'orders',
    title: 'Your orders | eCommerce',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/orders/presentation/order-list/order-list').then(
        (m) => m.OrderListComponent,
      ),
  },
  {
    path: 'orders/:id',
    title: 'Order details | eCommerce',
    loadComponent: () =>
      import('./features/orders/presentation/order-detail/order-detail').then(
        (m) => m.OrderDetailComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
