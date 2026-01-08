import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import * as ActionsSet from './mobile-phones.actions';
import { CreateMobilePhone } from '../domain/model/create-mobile-phone';
import { MobilePhonesRepository } from '../domain/ports/mobile-phones-repository.port';
import {
    CommonDescriptionExtrernalDto,
    CreateConnectivityExternalDto,
    CreateElectronicDetailsExternalDto,
    CreateMoneyExternalDto,
    CreateSatelliteNavigationSystemExternalDto,
    CreateSensorsExternalDto,
} from '../../../shared/api/nswag/api-client';

const createMobilePhoneBody: CreateMobilePhone = {
    commonDescription: new CommonDescriptionExtrernalDto({
        name: 'Nova X1',
        description: 'Prototype handset with high refresh display.',
        mainPhoto: 'https://picsum.photos/seed/nova-x1/640/640',
        otherPhotos: ['https://picsum.photos/seed/nova-x1-alt/640/640'],
    }),
    electronicDetails: new CreateElectronicDetailsExternalDto({
        cpu: 'Octa-core 3.2GHz',
        gpu: 'Adreno 740',
        ram: '12GB',
        storage: '256GB',
        displayType: 'OLED',
        refreshRateHz: 120,
        screenSizeInches: 6.7,
        width: 71.2,
        height: 162.4,
        batteryType: 'Li-Ion',
        batteryCapacity: 5000,
    }),
    connectivity: new CreateConnectivityExternalDto({
        has5G: true,
        wiFi: true,
        nfc: true,
        bluetooth: true,
    }),
    satelliteNavigationSystems: new CreateSatelliteNavigationSystemExternalDto({
        gps: true,
        agps: true,
        galileo: true,
        glonass: true,
        qzss: true,
    }),
    sensors: new CreateSensorsExternalDto({
        accelerometer: true,
        gyroscope: true,
        proximity: true,
        compass: true,
        barometer: false,
        halla: false,
        ambientLight: true,
    }),
    fingerPrint: true,
    faceId: true,
    price: new CreateMoneyExternalDto({
        amount: 999,
        currency: 'USD',
    }),
};

export class MobilePhonesEffects {
    private readonly actions$ = inject(Actions);
    private readonly repo = inject(MobilePhonesRepository);

    load$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ActionsSet.loadMobilePhones),
            switchMap(({ amount }) =>
                this.repo.getAll(amount).pipe(
                    map(items => ActionsSet.loadMobilePhonesSuccess({ items })),
                    catchError(e => of(ActionsSet.loadMobilePhonesFailure({ error: String(e) }))),
                )
            )
        )
    );

    loadById$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ActionsSet.loadMobilePhoneById),
            switchMap(({ id }) =>
                this.repo.getById(id).pipe(
                    map(item => ActionsSet.loadMobilePhoneByIdSuccess({ item })),
                    catchError(e => of(ActionsSet.loadMobilePhoneByIdFailure({ error: String(e) }))),
                )
            )
        )
    );

    create$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ActionsSet.createMobilePhone),
            switchMap(() =>
                this.repo.create(createMobilePhoneBody).pipe(
                    map(item => ActionsSet.createMobilePhoneSuccess({ item })),
                    catchError(e => of(ActionsSet.createMobilePhoneFailure({ error: String(e) }))),
                )
            )
        )
    );
}
