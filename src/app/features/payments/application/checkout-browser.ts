import { Injectable } from '@angular/core';

const key = 'stripeCheckoutReturn';
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateCheckoutUrl(value: string): string {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.host !== 'checkout.stripe.com' || url.username || url.password ||
        !url.pathname.startsWith('/c/pay/cs_test_')) throw new Error('The Checkout URL is not a trusted sandbox Stripe URL.');
    return url.href;
}

@Injectable({ providedIn: 'root' })
export class CheckoutBrowser {
    redirect(clientId: string, orderId: string, url: string): void {
        const destination = validateCheckoutUrl(url);
        // Persist only routing context, never a hosted URL, session secret or card data.
        try {
            sessionStorage.setItem(key, JSON.stringify({ clientId, orderId }));
        } catch { /* Checkout still works; return through order history if tab storage is unavailable. */ }
        window.location.assign(destination);
    }

    returningOrder(clientId: string | null): string | null {
        try {
            const data: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null');
            if (data && typeof data === 'object' && 'clientId' in data && data.clientId === clientId &&
                'orderId' in data && typeof data.orderId === 'string' && guid.test(data.orderId)) return data.orderId;
        } catch { /* An unavailable or malformed tab store is recoverable via order history. */ }
        return null;
    }
}
