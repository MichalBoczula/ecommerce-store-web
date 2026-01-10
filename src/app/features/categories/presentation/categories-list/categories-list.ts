import { Component, inject, OnInit } from '@angular/core';
import { CategoriesFacade } from '../../application/categories.facade';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatListModule } from "@angular/material/list";
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-categories-list',
  imports: [AsyncPipe, MatListModule, MatProgressBarModule],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss',
})
export class CategoriesList implements OnInit {
  readonly facade = inject(CategoriesFacade);

  ngOnInit(): void {
    this.facade.load();
  }
}
