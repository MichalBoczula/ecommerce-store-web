import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import * as ActionsSet from './mobile-phones.actions';
import { MobilePhonesRepository } from '../domain/interfaces/mobile-phones-repository.port';

@Injectable()
export class MobilePhonesEffects {
  private readonly actions$ = inject(Actions);
  private readonly repo = inject(MobilePhonesRepository);

  // One request stream cancels stale all-products and filtered responses alike.
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionsSet.loadMobilePhones, ActionsSet.loadMobilePhoneByFilter),
      switchMap((action) =>
        action.type === ActionsSet.loadMobilePhones.type
          ? this.repo.getAll(action.amount).pipe(
              map((items) => ActionsSet.loadMobilePhonesSuccess({ items })),
              catchError((e) => of(ActionsSet.loadMobilePhonesFailure({ error: String(e) }))),
            )
          : this.repo.getFilteredMobilePhones(action.filter).pipe(
              map((items) => ActionsSet.loadMobilePhoneByFilterSuccess({ items })),
              catchError((e) =>
                of(ActionsSet.loadMobilePhoneByFilterFailure({ error: String(e) })),
              ),
            ),
      ),
    ),
  );

  loadById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionsSet.loadMobilePhoneById),
      switchMap(({ id }) =>
        this.repo.getById(id).pipe(
          map((item) => ActionsSet.loadMobilePhoneByIdSuccess({ item })),
          catchError((e) => of(ActionsSet.loadMobilePhoneByIdFailure({ error: String(e) }))),
        ),
      ),
    ),
  );

  loadTop$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActionsSet.loadTopMobilePhone),
      switchMap(() =>
        this.repo.getTopMobilePhones().pipe(
          map((items) => ActionsSet.loadTopMobilePhoneSuccess({ items })),
          catchError((e) => of(ActionsSet.loadTopMobilePhoneFailure({ error: String(e) }))),
        ),
      ),
    ),
  );
}
