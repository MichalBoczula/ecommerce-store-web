import { Routes } from '@angular/router';
import { MobilePhoneList } from './features/mobile-phones/presentation/mobile-phone.list/mobile-phone.list';

export const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', component: MobilePhoneList },
        ],
    },
];