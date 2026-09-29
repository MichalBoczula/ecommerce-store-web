import { ShoppingCartLineResponse } from './shopping-cart-line-response.model';
import { ShoppingCartLineRequest } from './update-shopping-cart/shopping-cart-line-request.model';

export type CartMutation =
    | { kind: 'add'; productId: string; quantity: number }
    | { kind: 'increment' | 'decrement' | 'remove'; productId: string }
    | { kind: 'clear' };

export class CartValidationError extends Error {}

const maxQuantity = 2_147_483_647;
const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateProductId(productId: string): void {
    if (!guidPattern.test(productId) || productId.toLowerCase() === '00000000-0000-0000-0000-000000000000') {
        throw new CartValidationError('A valid product ID is required.');
    }
}

function validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) {
        throw new CartValidationError(`Quantity must be a whole number between 1 and ${maxQuantity}.`);
    }
}

// null means that the requested operation has no effect and does not need a PUT.
export function applyCartMutation(
    lines: readonly ShoppingCartLineResponse[],
    mutation: CartMutation
): ShoppingCartLineRequest[] | null {
    if (mutation.kind === 'clear') {
        return lines.length === 0 ? null : [];
    }

    for (const line of lines) {
        validateProductId(line.productId);
        validateQuantity(line.quantity);
    }

    validateProductId(mutation.productId);

    if (mutation.kind === 'add') {
        validateQuantity(mutation.quantity);
    }

    const index = lines.findIndex(line =>
        line.productId.toLowerCase() === mutation.productId.toLowerCase()
    );

    if (index < 0 && mutation.kind !== 'add') {
        return null;
    }

    if (mutation.kind === 'remove' || (mutation.kind === 'decrement' && lines[index].quantity === 1)) {
        return lines.filter((_, lineIndex) => lineIndex !== index).map(line => ({
            productId: line.productId,
            quantity: line.quantity,
        }));
    }

    if (mutation.kind === 'add' && index < 0) {
        return [...lines, { productId: mutation.productId, quantity: mutation.quantity }];
    }

    const quantity = lines[index].quantity +
        (mutation.kind === 'decrement' ? -1 : mutation.kind === 'add' ? mutation.quantity : 1);
    validateQuantity(quantity);

    return lines.map((line, lineIndex) => ({
        productId: line.productId,
        quantity: lineIndex === index ? quantity : line.quantity,
    }));
}
