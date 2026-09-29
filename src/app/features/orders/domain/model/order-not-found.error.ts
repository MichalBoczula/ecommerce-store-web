export class OrderNotFoundError extends Error {
    constructor() {
        super('This order could not be found.');
    }
}
