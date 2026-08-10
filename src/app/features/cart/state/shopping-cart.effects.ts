// import { inject, Injectable } from '@angular/core';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { catchError, map, switchMap, of } from 'rxjs';

// import { CartActions } from './shopping-cart.actions';
// import { ShoppingCartRepository } from '../infrastructure/api/shopping-cart-kiota-repository';

// @Injectable()
// export class ShoppingCartEffects {
//     private readonly actions$ = inject(Actions);
//     private readonly cartRepository = inject(ShoppingCartRepository);

//     loadCart$ = createEffect(() =>
//         this.actions$.pipe(
//             ofType(CartActions.loadCart),
//             switchMap(({ clientId }) =>
//                 this.cartRepository.getCartByClientId(clientId).pipe(
//                     map(cartItems => CartActions.loadCartSuccess({ cartItems })),
//                     catchError(error =>
//                         of(
//                             CartActions.loadCartFailure({
//                                 error: error.error?.detail || error.message || 'Failed to load shopping cart.',
//                             })
//                         )
//                     )
//                 )
//             )
//         )
//     );
// }