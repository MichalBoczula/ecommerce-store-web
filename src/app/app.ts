import { Component } from '@angular/core';
import { MainLayoutComponent } from './features/core/layout/main-layout.container';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
