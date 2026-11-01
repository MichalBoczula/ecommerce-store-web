import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MobilePhonesBrand } from '../../domain/model/mobile-phones-brand';
import { catalogFilterQuery, readCatalogFilter } from './catalog-filter-query';

@Component({
  selector: 'app-mobile-phone-filter',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './mobile-phone.filter.html',
  styleUrl: './mobile-phone.filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobilePhoneFilter {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly MobilePhonesBrand = MobilePhonesBrand;
  readonly applied = output<void>();

  readonly form = this.formBuilder.group(
    {
      brand: this.formBuilder.control<MobilePhonesBrand | null>(null),
      minimalPrice: this.formBuilder.control<number | null>(null, Validators.min(0)),
      maxPrice: this.formBuilder.control<number | null>(null, Validators.min(0)),
    },
    {
      validators: (control) => {
        const { minimalPrice, maxPrice } = control.value;
        return minimalPrice != null && maxPrice != null && minimalPrice > maxPrice
          ? { priceRange: true }
          : null;
      },
    },
  );

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const filter = readCatalogFilter(params);
        this.form.reset({
          brand: filter.brand ?? null,
          minimalPrice: filter.minimalPrice ?? null,
          maxPrice: filter.maximalPrice ?? null,
        });
      });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { brand, minimalPrice, maxPrice } = this.form.getRawValue();
    this.router.navigate(['/list'], {
      queryParams: catalogFilterQuery({ brand, minimalPrice, maximalPrice: maxPrice }),
    });
    this.applied.emit();
  }
}
