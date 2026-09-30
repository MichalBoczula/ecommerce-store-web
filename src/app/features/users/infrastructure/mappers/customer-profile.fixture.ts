import { CustomerResponseDto } from '../../../../shared/infrastructure/api-clients/users/models';

export const profileDto: CustomerResponseDto = {
    id: '33333333-3333-3333-3333-333333333333', externalId: 'demo-external-1',
    updatedAt: new Date('2026-09-29T12:00:00Z'),
    individual: {
        firstName: 'Mike', lastName: 'Customer', email: 'mike@example.com', phone: '123456789',
        billingAddress: { street: 'Main', buildingNumber: '10', apartmentNumber: '2',
            city: 'Warsaw', postalCode: '00-001' },
        shippingAddress: { street: 'Shipping', buildingNumber: '11', apartmentNumber: null,
            city: 'Krakow', postalCode: '30-001' },
    },
    companies: [{
        id: '44444444-4444-4444-4444-444444444444', companyName: 'Example Ltd', taxId: '1234567890',
        billingAddress: { street: 'Office', buildingNumber: '3', city: 'Gdansk', postalCode: '80-001' },
        shippingAddress: { street: 'Warehouse', buildingNumber: '7', city: 'Gdansk', postalCode: '80-002' },
    }],
};
