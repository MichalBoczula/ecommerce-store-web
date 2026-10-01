import { afterEach, describe, expect, it } from 'vitest';
import { CheckoutBrowser, validateCheckoutUrl } from './checkout-browser';

const clientId = '11111111-1111-1111-1111-111111111111';
const orderId = '22222222-2222-2222-2222-222222222222';

describe('hosted Checkout navigation', () => {
    afterEach(() => sessionStorage.clear());
    it('accepts only an HTTPS sandbox Checkout URL with no credentials', () => {
        const valid = 'https://checkout.stripe.com/c/pay/cs_test_demo#fixture';
        expect(validateCheckoutUrl(valid)).toBe(valid);
        for (const value of ['javascript:alert(1)', 'https://checkout.stripe.com.attacker.test/c/pay/cs_test_demo',
            'https://user@checkout.stripe.com/c/pay/cs_test_demo', 'http://checkout.stripe.com/c/pay/cs_test_demo',
            'https://checkout.stripe.com/c/pay/cs_live_demo', 'https://checkout.stripe.com:444/c/pay/cs_test_demo']) {
            expect(() => validateCheckoutUrl(value)).toThrow();
        }
    });
    it('recovers only matching demo customer routing context and ignores malformed storage', () => {
        const browser = new CheckoutBrowser();
        expect(browser.returningOrder(clientId)).toBeNull();
        sessionStorage.setItem('stripeCheckoutReturn', JSON.stringify({ clientId, orderId }));
        expect(browser.returningOrder(clientId)).toBe(orderId);
        expect(browser.returningOrder('another-customer')).toBeNull();
        sessionStorage.setItem('stripeCheckoutReturn', '{broken');
        expect(browser.returningOrder(clientId)).toBeNull();
        sessionStorage.setItem('stripeCheckoutReturn', JSON.stringify({ clientId, orderId: '../bad' }));
        expect(browser.returningOrder(clientId)).toBeNull();
    });
});
