import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
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
        loadComponent: () => import('../app/features/cart/presentation/shopping-cart')
            .then(m => m.ShoppingCartComponent)
    },
];