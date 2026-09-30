import { computed, Injectable, signal } from '@angular/core';

export interface DemoCustomerSelection {
    clientId: string;
    externalId: string | null;
}

const key = 'demoCustomer';
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readSelection(): DemoCustomerSelection | null {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null && 'clientId' in parsed &&
                typeof parsed.clientId === 'string' && guid.test(parsed.clientId) &&
                'externalId' in parsed && (parsed.externalId === null || typeof parsed.externalId === 'string')) {
                return { clientId: parsed.clientId, externalId: parsed.externalId };
            }
        }
        // Existing acceptance fixtures and demo sessions stored only the customer GUID.
        const legacyId = localStorage.getItem('demoClientId');
        const legacyExternalId = localStorage.getItem('demoExternalId');
        return legacyId && guid.test(legacyId)
            ? { clientId: legacyId, externalId: legacyExternalId || null } : null;
    } catch {
        return null;
    }
}

@Injectable({ providedIn: 'root' })
export class CustomerContext {
    readonly selection = signal<DemoCustomerSelection | null>(readSelection());
    readonly clientId = computed(() => this.selection()?.clientId ?? null);
    readonly externalId = computed(() => this.selection()?.externalId ?? null);

    select(clientId: string, externalId: string): void {
        if (!guid.test(clientId) || !externalId.trim()) throw new Error('Invalid customer selection.');
        const selected = { clientId, externalId: externalId.trim() };
        localStorage.setItem(key, JSON.stringify(selected));
        localStorage.removeItem('demoClientId');
        localStorage.removeItem('demoExternalId');
        this.selection.set(selected);
    }

    clear(): void {
        localStorage.removeItem(key);
        localStorage.removeItem('demoClientId');
        localStorage.removeItem('demoExternalId');
        this.selection.set(null);
    }
}
