import { Routes } from '@angular/router';
import { MobilePhoneList } from './features/mobile-phones/presentation/mobile-phone.list/mobile-phone.list';
import { MobilePhoneDetails } from './features/mobile-phones/presentation/mobile-phone.details/mobile-phone.details';

export const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'list', component: MobilePhoneList },
            { path: 'details/:id', component: MobilePhoneDetails }
        ],
    },
];