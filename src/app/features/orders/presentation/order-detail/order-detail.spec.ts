import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderHistoryFacade } from '../../application/order-history.facade';
import { Order } from '../../domain/model/order';
import { OrderDetailComponent } from './order-detail';

const orderId = '11111111-1111-1111-1111-111111111111';
const order: Order = {
    id: orderId, clientId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    createdAt: new Date('2026-08-01T12:00:00Z'), updatedAt: null, status: 'Pending',
    totalAmount: 190, totalCurrency: 'EUR',
    lines: [{ productVersionId: '44444444-4444-4444-4444-444444444444', quantity: 2,
        lineTotalAmount: 190, productVersion: { id: '44444444-4444-4444-4444-444444444444',
            productId: '33333333-3333-3333-3333-333333333333', name: 'Saved phone name',
            brand: 'Saved brand', priceAmount: 95, priceCurrency: 'EUR' },
    }],
};

describe('order details', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('loads route changes and renders saved product and line totals', () => {
        const params = new BehaviorSubject(convertToParamMap({ id: orderId }));
        const facade = {
            selectedOrder: signal<Order | null>(order), detailStatus: signal('loaded'),
            detailError: signal<string | null>(null), loadOrder: vi.fn(),
        };
        TestBed.configureTestingModule({ imports: [OrderDetailComponent], providers: [
            provideRouter([]), { provide: OrderHistoryFacade, useValue: facade },
            { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
        ] });
        const fixture = TestBed.createComponent(OrderDetailComponent);
        fixture.detectChanges();

        expect(facade.loadOrder).toHaveBeenCalledWith(orderId);
        expect(fixture.nativeElement.textContent).toContain('Saved phone name');
        expect(fixture.nativeElement.textContent).toContain('Saved brand');
        expect(fixture.nativeElement.textContent).toContain('95.00');
        expect(fixture.nativeElement.textContent).toContain('190.00');

        params.next(convertToParamMap({ id: 'another-id' }));
        expect(facade.loadOrder).toHaveBeenCalledWith('another-id');
    });

    it('shows a missing order error instead of stale details', () => {
        const params = new BehaviorSubject(convertToParamMap({ id: orderId }));
        const facade = {
            selectedOrder: signal<Order | null>(null), detailStatus: signal('error'),
            detailError: signal('This order could not be found.'), loadOrder: vi.fn(),
        };
        TestBed.configureTestingModule({ imports: [OrderDetailComponent], providers: [
            provideRouter([]), { provide: OrderHistoryFacade, useValue: facade },
            { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
        ] });
        const fixture = TestBed.createComponent(OrderDetailComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('not be found');
        expect(fixture.nativeElement.textContent).not.toContain('Saved phone name');
        (fixture.nativeElement.querySelector('[role="alert"] button') as HTMLButtonElement).click();
        expect(facade.loadOrder).toHaveBeenCalledTimes(2);
    });
});
