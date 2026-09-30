import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { distinctUntilChanged, map } from 'rxjs';
import { OrderHistoryFacade } from '../../application/order-history.facade';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { PaymentsFacade } from '../../../payments/application/payments.facade';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
    templateUrl: './order-detail.html',
    styleUrl: './order-detail.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly facade = inject(OrderHistoryFacade);
    private readonly payments = inject(PaymentsFacade);
    readonly customer = inject(CustomerContext);

    readonly status = this.facade.detailStatus;
    readonly error = this.facade.detailError;
    readonly order = computed(() => {
        const selected = this.facade.selectedOrder();
        return selected?.clientId === this.customer.clientId() ? selected : null;
    });
    readonly paymentStatus = computed(() => this.payments.orderId() === this.order()?.id
        ? this.payments.status() : 'idle');
    readonly paymentError = computed(() => this.payments.orderId() === this.order()?.id
        ? this.payments.error() : null);
    readonly payment = computed(() => {
        const order = this.order();
        return order && this.payments.orderId() === order.id ? this.payments.payment() : null;
    });

    constructor() {
        effect(() => {
            const order = this.order();
            if (this.status() === 'loaded' && order?.status === 'Created') {
                this.payments.load(order.id);
            }
        });
    }

    ngOnInit(): void {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(id => {
            if (id && this.customer.clientId()) this.facade.loadOrder(id);
        });
    }

    reload(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && this.customer.clientId()) this.facade.loadOrder(id);
    }

    reloadPayment(orderId: string): void {
        if (this.order()?.id === orderId) this.payments.load(orderId);
    }

    preparePayment(): void {
        const order = this.order();
        if (order?.status === 'Created' && this.paymentStatus() === 'ready' && !this.payment()) {
            this.payments.prepare(order.id);
        }
    }
}
