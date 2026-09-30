import { InjectionToken } from '@angular/core';

const fallbackClientId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Temporary demo identity until the authenticated client context lands in WEB/11.
// Acceptance tests select the customer they registered through this browser-local key.
export const DEMO_CLIENT_ID = new InjectionToken<string>('Demo client ID', {
    providedIn: 'root',
    factory: () => {
        try {
            const selected = localStorage.getItem('demoClientId');
            return selected && guid.test(selected) ? selected : fallbackClientId;
        } catch {
            return fallbackClientId;
        }
    },
});
