import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'categories' },

    {
        path: 'categories',
        loadChildren: () =>
            import('./features/categories/presentation/categories.routes')
                .then(m => m.CATEGORIES_ROUTES),
    },

    { path: '**', redirectTo: 'categories' },
];