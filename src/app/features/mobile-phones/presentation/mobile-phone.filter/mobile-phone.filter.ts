import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MobilePhonesFacade } from '../../application/mobile-phones.facade';
import { FilterMobilePhone } from '../../domain/model/filter-mobile-phones';
import { MobilePhoneFilterDto, MobilePhonesBrand } from '../../../../shared/api/nswag/api-client';

@Component({
  selector: 'app-mobile-phone-filter',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './mobile-phone.filter.html',
  styleUrl: './mobile-phone.filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobilePhoneFilter {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly facade = inject(MobilePhonesFacade);
  protected readonly MobilePhonesBrand = MobilePhonesBrand;

  readonly form = this.formBuilder.group({
    brand: this.formBuilder.control<MobilePhonesBrand | null>(null),
    minimalPrice: this.formBuilder.control<number | null>(null),
    maxPrice: this.formBuilder.control<number | null>(null),
  });

  onSubmit(): void {
    const raw = this.form.getRawValue();

    const filter: FilterMobilePhone = new MobilePhoneFilterDto();
    filter.brand = raw.brand ?? undefined;
    filter.minimalPrice = raw.minimalPrice ?? undefined;
    filter.maximalPrice = raw.maxPrice ?? undefined;

    this.facade.loadByFilter(filter);
    this.router.navigate(['/list']);
  }
}