export class CatalogProductsNotFoundError extends Error {
    constructor() {
        super('One or more products are unavailable in the catalog.');
    }
}
