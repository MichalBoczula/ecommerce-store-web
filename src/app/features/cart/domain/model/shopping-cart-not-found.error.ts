export class ShoppingCartNotFoundError extends Error {
    constructor() {
        super('Shopping cart is missing because account registration is incomplete.');
    }
}
