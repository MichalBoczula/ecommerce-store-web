import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderHistoryFacade } from '../../application/order-history.facade';
import { Order } from '../../domain/model/order';
import { OrderListComponent } from './order-list';

const order: Order = {
    id: '11111111-1111-1111-1111-111111111111',
    clientId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    createdAt: new Date('2026-08-01T12:00:00Z'),
    updatedAt: null,
    status: 'Pending',
    totalAmount: 190,
    totalCurrency: 'EUR',
    lines: [],
};

describe('order history list', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads client orders and displays server totals with a detail link', () => {
        const facade = {
            orders: signal([order]), listStatus: signal('loaded'), listError: signal(null), loadOrders: vi.fn(),
        };
        TestBed.configureTestingModule({ imports: [OrderListComponent], providers: [
            provideRouter([]), { provide: OrderHistoryFacade, useValue: facade },
        ] });
        const fixture = TestBed.createComponent(OrderListComponent);
        fixture.detectChanges();

        expect(facade.loadOrders).toHaveBeenCalledWith(order.clientId);
        expect(fixture.nativeElement.textContent).toContain('190.00');
        expect(fixture.nativeElement.textContent).toContain('EUR');
        expect((fixture.nativeElement.querySelector('a[aria-label^="View order"]') as HTMLAnchorElement)
            .getAttribute('href')).toBe(`/orders/${order.id}`);
    });

    it('distinguishes an empty history from a load failure', () => {
        const facade = {
            orders: signal<Order[]>([]), listStatus: signal('loaded'), listError: signal<string | null>(null), loadOrders: vi.fn(),
        };
        TestBed.configureTestingModule({ imports: [OrderListComponent], providers: [
            provideRouter([]), { provide: OrderHistoryFacade, useValue: facade },
        ] });
        const fixture = TestBed.createComponent(OrderListComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('You have no orders yet.');

        facade.listStatus.set('error');
        facade.listError.set('Network unavailable');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Network unavailable');
        expect(fixture.nativeElement.textContent).not.toContain('You have no orders yet.');
    });
});
