import {
    CommonDescriptionExtrernalDto,
    CreateConnectivityExternalDto,
    CreateElectronicDetailsExternalDto,
    CreateMoneyExternalDto,
    CreateSatelliteNavigationSystemExternalDto,
    CreateSensorsExternalDto,
} from '../../../../shared/api/nswag/api-client';

export interface CreateMobilePhone {
    commonDescription: CommonDescriptionExtrernalDto;
    electronicDetails: CreateElectronicDetailsExternalDto;
    connectivity: CreateConnectivityExternalDto;
    satelliteNavigationSystems: CreateSatelliteNavigationSystemExternalDto;
    sensors: CreateSensorsExternalDto;
    fingerPrint?: boolean;
    faceId?: boolean;
    categoryId?: string;
    price: CreateMoneyExternalDto;
}
