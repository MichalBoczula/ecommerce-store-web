import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'categories',
        loadChildren: () =>
            import('./features/categories/presentation/categories.routes')
                .then(m => m.CATEGORIES_ROUTES),
    },
];
