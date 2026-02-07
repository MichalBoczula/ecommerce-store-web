import { Component } from '@angular/core';
import { MobilePhoneContainer } from "./features/mobile-phones/presentation/mobile-phone.container/mobile-phone.container";

@Component({
  selector: 'app-root',
  imports: [MobilePhoneContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
