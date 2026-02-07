import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

type SpecRow = {
  label: string;
  value: string | string[];
};

@Component({
  selector: 'app-mobile-phone-details',
  imports: [CommonModule, MatTableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mobile-phone.details.html',
  styleUrl: './mobile-phone.details.scss',
  standalone: true
})
export class MobilePhoneDetails {
  private readonly route = inject(ActivatedRoute);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  cards = [1, 2, 3];

  readonly images = [
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
    'https://material.angular.dev/assets/img/examples/shiba1.jpg',
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
  ];

  displayedColumns = ['label', 'value'];

  dataSource: SpecRow[] = [
    { label: 'Procesor', value: 'Qualcomm Snapdragon 8 Elite (2x 4.32 GHz + 6x 3.5 GHz)' },
    { label: 'Pamięć RAM', value: '12 GB' },
    { label: 'Pamięć wbudowana', value: '256 GB' },
    { label: 'Typ ekranu', value: 'Dotykowy, Dynamic AMOLED 2X' },
    { label: 'Częstotliwość odświeżania ekranu', value: '120 Hz' },
    { label: 'Przekątna ekranu', value: '6,9"' },
    { label: 'Rozdzielczość ekranu', value: '3120 x 1440' },
    {
      label: 'Rozdzielczość aparatu - tył',
      value: [
        '200.0 Mpix',
        '50.0 Mpix - ultraszerokokątny',
        '50.0 Mpix - teleobiektyw',
        '10.0 Mpix - teleobiektyw',
      ],
    },
    { label: 'Rozdzielczość aparatu - przód', value: '12.0 Mpix' },
  ];

  asLines(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }
}
