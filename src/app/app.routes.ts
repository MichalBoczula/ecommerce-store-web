import { Routes } from '@angular/router';
import { MobilePhoneList } from './features/mobile-phones/presentation/mobile-phone.list/mobile-phone.list';
import { MobilePhoneDetails } from './features/mobile-phones/presentation/mobile-phone.details/mobile-phone.details';
import { MobilePhoneHome } from './features/mobile-phones/presentation/mobile-phone.home/mobile-phone.home';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: MobilePhoneHome },
    { path: 'list', component: MobilePhoneList },
    { path: 'details/:id', component: MobilePhoneDetails },
];