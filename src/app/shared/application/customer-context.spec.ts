import { describe, expect, it, afterEach } from 'vitest';
import { CustomerContext } from './customer-context';

const id = '33333333-3333-3333-3333-333333333333';
describe('demo customer context', () => {
    afterEach(() => localStorage.clear());

    it('has no invented default customer and resolves the legacy demo GUID', () => {
        localStorage.clear();
        expect(new CustomerContext().clientId()).toBeNull();
        localStorage.setItem('demoClientId', id);
        const context = new CustomerContext();
        expect(context.clientId()).toBe(id);
        expect(context.externalId()).toBeNull();
    });

    it('persists a resolved profile selection and clears it explicitly', () => {
        localStorage.clear();
        const context = new CustomerContext();
        context.select(id, 'external-1');
        expect(new CustomerContext().selection()).toEqual({ clientId: id, externalId: 'external-1' });
        context.clear();
        expect(new CustomerContext().selection()).toBeNull();
        expect(() => context.select('invalid', 'external-1')).toThrow('Invalid customer');
    });
});
