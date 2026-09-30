export interface CustomerAddress {
    postalCode: string;
    city: string;
    street: string;
    buildingNumber: string;
    apartmentNumber: string;
}

export interface CustomerIndividual {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    billingAddress: CustomerAddress;
    shippingAddress: CustomerAddress;
}

export interface CustomerCompany {
    id: string;
    companyName: string;
    taxId: string;
    billingAddress: CustomerAddress;
    shippingAddress: CustomerAddress;
}

export interface CustomerProfile {
    id: string;
    externalId: string;
    individual: CustomerIndividual;
    companies: CustomerCompany[];
    updatedAt: Date | null;
}
