import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ShellComponent } from "./core/layout/shell/shell.component";

@Component({
  selector: 'app-root',
  imports: [MatToolbarModule, MatButtonModule, ShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ecommerce-store-web');
}
