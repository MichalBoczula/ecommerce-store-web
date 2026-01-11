import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '' },

    {
        path: 'categories',
        loadChildren: () =>
            import('./features/categories/categories.routes')
                .then(m => m.CATEGORIES_ROUTES),
    },
];
