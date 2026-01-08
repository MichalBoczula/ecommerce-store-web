import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'categories' },

    {
        path: 'categories',
        loadChildren: () =>
            import('./features/categories/presentation/categories.routes')
                .then(m => m.CATEGORIES_ROUTES),
    },
    {
        path: 'mobile-phones',
        loadChildren: () =>
            import('./features/mobile-phones/presentation/mobile-phones.routes')
                .then(m => m.MOBILE_PHONES_ROUTES),
    },

    { path: '**', redirectTo: 'categories' },
];
