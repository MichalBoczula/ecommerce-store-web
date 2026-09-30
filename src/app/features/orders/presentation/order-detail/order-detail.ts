import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { distinctUntilChanged, map } from 'rxjs';
import { OrderHistoryFacade } from '../../application/order-history.facade';
import { CustomerContext } from '../../../../shared/application/customer-context';

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
    readonly customer = inject(CustomerContext);

    readonly status = this.facade.detailStatus;
    readonly error = this.facade.detailError;
    readonly order = computed(() => {
        const selected = this.facade.selectedOrder();
        return selected?.clientId === this.customer.clientId() ? selected : null;
    });

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
}
