import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./features/mobile-phones/presentation/mobile-phone.home/mobile-phone.home')
            .then(m => m.MobilePhoneHome)
    },
    {
        path: 'list',
        loadComponent: () => import('./features/mobile-phones/presentation/mobile-phone.list/mobile-phone.list')
            .then(m => m.MobilePhoneList)
    },
    {
        path: 'details/:id',
        loadComponent: () => import('./features/mobile-phones/presentation/mobile-phone.details/mobile-phone.details')
            .then(m => m.MobilePhoneDetails)
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/presentation/shopping-cart/shopping-cart')
            .then(m => m.ShoppingCartComponent)
    },
    {
        path: 'favorites',
        loadComponent: () => import('./features/users/presentation/favorites/favorites.component')
            .then(m => m.FavoritesComponent)
    },
    {
        path: 'orders',
        pathMatch: 'full',
        loadComponent: () => import('./features/orders/presentation/order-list/order-list')
            .then(m => m.OrderListComponent)
    },
    {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/presentation/order-detail/order-detail')
            .then(m => m.OrderDetailComponent)
    },
    {
        path: '**',
        redirectTo: 'home',
    },
];
