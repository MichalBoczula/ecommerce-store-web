import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-mobile-phone-details',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mobile-phone.details.html',
  styleUrl: './mobile-phone.details.scss',
})
export class MobilePhoneDetails {
  cards = [1, 2, 3];

  readonly images = [
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
    'https://material.angular.dev/assets/img/examples/shiba1.jpg',
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
  ];
}
