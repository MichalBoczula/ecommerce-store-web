import { CustomerContext } from '../../../../shared/application/customer-context';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { OrderHistoryFacade } from '../../application/order-history.facade';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
    templateUrl: './order-list.html',
    styleUrl: './order-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
    private readonly facade = inject(OrderHistoryFacade);
    private readonly customer = inject(CustomerContext);
    readonly selectedClientId = this.customer.clientId;
    private get clientId(): string | null { return this.customer.clientId(); }

    readonly status = this.facade.listStatus;
    readonly error = this.facade.listError;
    readonly orders = computed(() => [...this.facade.orders()].sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()));

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        if (this.clientId) this.facade.loadOrders(this.clientId);
    }
}
