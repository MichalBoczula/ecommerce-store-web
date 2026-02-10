import { TestBed } from '@angular/core/testing';
import { CategoriesList } from './categories-list';
import { CategoriesFacade } from '../../application/categories.facade'; // dopasuj ścieżkę
import { of } from 'rxjs';

class CategoriesFacadeStub {
  categories$ = of([]);
  load = jasmine.createSpy('load');
}

describe('CategoriesList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesList],
      providers: [{ provide: CategoriesFacade, useClass: CategoriesFacadeStub }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CategoriesList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
