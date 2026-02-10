import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { map, Observable } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { asLines, isNotNullOrWhiteSpace, toDescriptions, toSpecRows } from './mobile-phone.details.utils';

export type SpecRow =
  | { label: string; kind: 'text'; value: string | string[] }
  | { label: string; kind: 'bool'; value: boolean };

@Component({
  selector: 'app-mobile-phone-details',
  imports: [CommonModule, MatTableModule, MatCheckboxModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mobile-phone.details.html',
  styleUrl: './mobile-phone.details.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MobilePhonesFacade);
  specRows$!: Observable<SpecRow[]>;
  descriptions$!: Observable<string[]>;
  asLines = asLines;
  isNotNullOrWhiteSpace = isNotNullOrWhiteSpace;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadById(id);

    this.specRows$ = this.facade.details$.pipe(
      map(details => toSpecRows(details!))
    );

    this.descriptions$ = this.facade.details$.pipe(
      map(details => toDescriptions(details!))
    );
  }

  readonly images = [
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
    'https://material.angular.dev/assets/img/examples/shiba1.jpg',
    'https://material.angular.dev/assets/img/examples/shiba2.jpg',
  ];

  displayedColumns = ['label', 'value'];
}