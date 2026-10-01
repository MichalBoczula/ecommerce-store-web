import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, OnInit, signal } from '@angular/core';
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

    private watchKey: string | null = null;
    readonly returnHint = signal<string | null>(null);

    readonly status = this.facade.detailStatus;
    readonly error = this.facade.detailError;
    readonly order = computed(() => {
        const selected = this.facade.selectedOrder();
        if (selected?.clientId !== this.customer.clientId()) return null;
        const progress = this.payments.progress();
        return progress?.order.id === selected.id && progress.order.clientId === this.customer.clientId()
            ? progress.order : selected;
    });
    readonly paymentStatus = computed(() => this.payments.orderId() === this.order()?.id
        ? this.payments.status() : 'idle');
    readonly paymentError = computed(() => this.payments.orderId() === this.order()?.id
        ? this.payments.error() : null);
    readonly payment = computed(() => {
        const order = this.order();
        return order && this.payments.orderId() === order.id ? this.payments.payment() : null;
    });

    readonly invoice = computed(() => this.payments.progress()?.order.id === this.order()?.id &&
        this.payments.clientId() === this.customer.clientId() ? this.payments.progress()?.invoice : null);
    readonly exhausted = this.payments.exhausted;
    readonly canCheckout = computed(() => {
        const order = this.order();
        return order?.status === 'Created' && order.totalCurrency === 'PLN' && order.totalAmount >= 2 &&
            ['ready', 'watching'].includes(this.paymentStatus()) && !!this.payments.progress() &&
            !['succeeded', 'cancelled'].includes(this.payment()?.status ?? '');
    });

    constructor() {
        effect(() => {
            const order = this.facade.selectedOrder();
            const clientId = this.customer.clientId();
            const key = this.status() === 'loaded' && order?.clientId === clientId && clientId
                ? `${clientId}:${order.id}` : null;
            if (key !== this.watchKey) {
                this.watchKey = key;
                if (key && clientId && order) this.payments.watch(clientId, order.id);
                else this.payments.stopWatching();
            }
        });
        this.destroyRef.onDestroy(() => this.payments.stopWatching());
    }

    ngOnInit(): void {
        this.returnHint.set(this.route.snapshot.queryParamMap?.get('checkout') ?? null);
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
        const clientId = this.customer.clientId();
        if (clientId && this.order()?.id === orderId) this.payments.watch(clientId, orderId);
    }

    checkout(): void {
        const order = this.order();
        const clientId = this.customer.clientId();
        if (order && clientId && this.canCheckout()) this.payments.checkout(clientId, order.id);
    }
}
