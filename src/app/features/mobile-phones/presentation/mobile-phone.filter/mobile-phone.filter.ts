import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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

  readonly form = this.formBuilder.group({
    brand: [''],
    minimalPrice: [null as number | null],
    maxPrice: [null as number | null]
  });

  onSubmit(): void {
    this.send(this.form.getRawValue());
  }

  send(body: unknown): void {
    console.log(body);
  }
}
