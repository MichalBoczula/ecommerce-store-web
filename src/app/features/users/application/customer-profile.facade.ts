import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CustomerCompany, CustomerIndividual } from '../domain/model/customer-profile';
import { CustomerProfileActions } from '../state/customer-profile.actions';
import { customerProfileFeature } from '../state/customer-profile.feature';

@Injectable()
export class CustomerProfileFacade {
    private readonly store = inject(Store);
    readonly profile = this.store.selectSignal(customerProfileFeature.selectProfile);
    readonly loadStatus = this.store.selectSignal(customerProfileFeature.selectLoadStatus);
    readonly saveStatus = this.store.selectSignal(customerProfileFeature.selectSaveStatus);
    readonly error = this.store.selectSignal(customerProfileFeature.selectError);

    load(externalId: string): void {
        if (externalId.trim()) this.store.dispatch(CustomerProfileActions.load({ externalId: externalId.trim() }));
    }
    save(clientId: string, individual: CustomerIndividual): void {
        if (this.saveStatus() !== 'saving') this.store.dispatch(CustomerProfileActions.save({ clientId, individual }));
    }
    saveCompany(clientId: string, company: CustomerCompany): void {
        if (this.saveStatus() !== 'saving') this.store.dispatch(CustomerProfileActions.saveCompany({ clientId, company }));
    }
}
