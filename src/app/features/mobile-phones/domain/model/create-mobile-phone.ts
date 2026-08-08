import {
    CommonDescriptionExtrernalDto,
    CreateConnectivityExternalDto,
    CreateElectronicDetailsExternalDto,
    CreateMoneyExternalDto,
    CreateSatelliteNavigationSystemExternalDto,
    CreateSensorsExternalDto,
} from '../../infrastructure/api-clients/products/models';

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
