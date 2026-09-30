import { AddressResponseDto, CustomerResponseDto, UpdateCompanyRequestDto, UpdateIndividualDataRequestDto } from '../../../../shared/infrastructure/api-clients/users/models';
import { CustomerAddress, CustomerCompany, CustomerIndividual, CustomerProfile } from '../../domain/model/customer-profile';

function required(value: string | null | undefined, field: string): string {
    if (!value) throw new Error(`Invalid customer profile: ${field} is missing.`);
    return value;
}

function address(dto: AddressResponseDto | null | undefined, field: string): CustomerAddress {
    if (!dto) throw new Error(`Invalid customer profile: ${field} is missing.`);
    return {
        postalCode: required(dto.postalCode, `${field}.postalCode`),
        city: required(dto.city, `${field}.city`),
        street: required(dto.street, `${field}.street`),
        buildingNumber: required(dto.buildingNumber, `${field}.buildingNumber`),
        apartmentNumber: dto.apartmentNumber ?? '',
    };
}

export function mapCustomerProfile(dto: CustomerResponseDto): CustomerProfile {
    if (!dto.individual) throw new Error('Invalid customer profile: individual is missing.');
    return {
        id: required(dto.id, 'id'),
        externalId: required(dto.externalId, 'externalId'),
        updatedAt: dto.updatedAt ?? null,
        individual: {
            firstName: required(dto.individual.firstName, 'individual.firstName'),
            lastName: required(dto.individual.lastName, 'individual.lastName'),
            email: required(dto.individual.email, 'individual.email'),
            phone: required(dto.individual.phone, 'individual.phone'),
            billingAddress: address(dto.individual.billingAddress, 'billingAddress'),
            shippingAddress: address(dto.individual.shippingAddress, 'shippingAddress'),
        },
        companies: (dto.companies ?? []).map(company => ({
            id: required(company.id, 'company.id'),
            companyName: required(company.companyName, 'company.companyName'),
            taxId: required(company.taxId, 'company.taxId'),
            billingAddress: address(company.billingAddress, 'company.billingAddress'),
            shippingAddress: address(company.shippingAddress, 'company.shippingAddress'),
        })),
    };
}

function toAddress(value: CustomerAddress) {
    return {
        postalCode: value.postalCode.trim(), city: value.city.trim(), street: value.street.trim(),
        buildingNumber: value.buildingNumber.trim(), apartmentNumber: value.apartmentNumber.trim(),
    };
}

export function mapIndividualRequest(individual: CustomerIndividual): UpdateIndividualDataRequestDto {
    return { individual: {
        firstName: individual.firstName.trim(), lastName: individual.lastName.trim(),
        email: individual.email.trim(), phone: individual.phone.trim(),
        billingAddress: toAddress(individual.billingAddress),
        shippingAddress: toAddress(individual.shippingAddress),
    } };
}

export function mapCompanyRequest(company: CustomerCompany): UpdateCompanyRequestDto {
    return {
        companyName: company.companyName.trim(), taxId: company.taxId.trim(),
        billingAddress: toAddress(company.billingAddress),
        shippingAddress: toAddress(company.shippingAddress),
    };
}
