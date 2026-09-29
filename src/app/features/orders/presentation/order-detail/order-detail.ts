import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { distinctUntilChanged, map } from 'rxjs';
import { OrderHistoryFacade } from '../../application/order-history.facade';

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

    readonly status = this.facade.detailStatus;
    readonly error = this.facade.detailError;
    readonly order = this.facade.selectedOrder;

    ngOnInit(): void {
        this.route.paramMap.pipe(
            map(params => params.get('id')),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(id => {
            if (id) this.facade.loadOrder(id);
        });
    }

    reload(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.facade.loadOrder(id);
    }
}
