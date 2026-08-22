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
        path: '**',
        redirectTo: 'home',
    },
];