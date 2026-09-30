import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CustomerContext } from '../../../../shared/application/customer-context';
import { CustomerProfileFacade } from '../../application/customer-profile.facade';
import { CustomerCompany, CustomerIndividual } from '../../domain/model/customer-profile';

@Component({
    selector: 'app-customer-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule],
    templateUrl: './customer-profile.html',
    styleUrl: './customer-profile.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerProfileComponent implements OnInit {
    private readonly facade = inject(CustomerProfileFacade);
    private readonly context = inject(CustomerContext);
    private readonly document = inject(DOCUMENT);
    externalId = this.context.externalId() ?? '';
    readonly selectedId = this.context.clientId;
    readonly selectedExternalId = this.context.externalId;
    readonly profile = this.facade.profile;
    readonly loadStatus = this.facade.loadStatus;
    readonly saveStatus = this.facade.saveStatus;
    readonly error = this.facade.error;
    readonly individual = signal<CustomerIndividual | null>(null);
    readonly companies = signal<CustomerCompany[]>([]);

    constructor() {
        effect(() => {
            const profile = this.profile();
            if (!profile) { this.individual.set(null); this.companies.set([]); return; }
            this.individual.set(structuredClone(profile.individual));
            this.companies.set(structuredClone(profile.companies));
            if (this.context.clientId() !== profile.id || this.context.externalId() !== profile.externalId) {
                this.context.select(profile.id, profile.externalId);
                // The demo customer changed: restart feature stores before showing another customer's data.
                this.document.defaultView?.location.reload();
            }
        });
    }

    ngOnInit(): void {
        if (this.externalId) this.facade.load(this.externalId);
    }

    load(): void {
        this.facade.load(this.externalId);
    }

    save(form: NgForm): void {
        const profile = this.profile();
        const individual = this.individual();
        if (!profile || !individual || form.invalid || this.saveStatus() === 'saving') return;
        this.facade.save(profile.id, structuredClone(individual));
    }

    saveCompany(company: CustomerCompany, form: NgForm): void {
        const profile = this.profile();
        if (!profile || form.invalid || this.saveStatus() === 'saving') return;
        this.facade.saveCompany(profile.id, structuredClone(company));
    }

    clearSelection(): void {
        this.context.clear();
        this.document.defaultView?.location.reload();
    }
}
