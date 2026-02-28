import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-mobile-phone-filter',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatSliderModule],
  templateUrl: './mobile-phone.filter.html',
  styleUrl: './mobile-phone.filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobilePhoneFilter {

}
