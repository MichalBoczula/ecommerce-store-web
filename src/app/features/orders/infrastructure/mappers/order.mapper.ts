import { OrderLineResponseDto, OrderResponseDto, ProductVersionResponseDto } from '../../../../shared/infrastructure/api-clients/orders/models';
import { Order, OrderLine, ProductSnapshot } from '../../domain/model/order';

function requiredString(value: string | null | undefined, field: string): string {
    if (!value) throw new Error(`Invalid order response: ${field} is missing.`);
    return value;
}

function requiredNumber(value: number | null | undefined, field: string): number {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        throw new Error(`Invalid order response: ${field} is missing or invalid.`);
    }
    return value;
}

function requiredDate(value: Date | null | undefined, field: string): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new Error(`Invalid order response: ${field} is missing or invalid.`);
    }
    return value;
}

function mapProductSnapshot(dto: ProductVersionResponseDto | null | undefined): ProductSnapshot {
    if (!dto) throw new Error('Invalid order response: productVersion is missing.');
    return {
        id: requiredString(dto.id, 'productVersion.id'),
        productId: requiredString(dto.productId, 'productVersion.productId'),
        name: requiredString(dto.name, 'productVersion.name'),
        brand: requiredString(dto.brand, 'productVersion.brand'),
        priceAmount: requiredNumber(dto.priceAmount, 'productVersion.priceAmount'),
        priceCurrency: requiredString(dto.priceCurrency, 'productVersion.priceCurrency'),
    };
}

function mapOrderLine(dto: OrderLineResponseDto): OrderLine {
    return {
        productVersionId: requiredString(dto.productVersionId, 'line.productVersionId'),
        quantity: requiredNumber(dto.quantity, 'line.quantity'),
        productVersion: mapProductSnapshot(dto.productVersion),
        lineTotalAmount: requiredNumber(dto.lineTotalAmount, 'line.lineTotalAmount'),
    };
}

export function mapOrderResponse(dto: OrderResponseDto): Order {
    if (!Array.isArray(dto.lines)) throw new Error('Invalid order response: lines are missing.');
    return {
        id: requiredString(dto.id, 'id'),
        clientId: requiredString(dto.clientId, 'clientId'),
        createdAt: requiredDate(dto.createdAt, 'createdAt'),
        updatedAt: dto.updatedAt == null ? null : requiredDate(dto.updatedAt, 'updatedAt'),
        status: requiredString(dto.status, 'status'),
        totalAmount: requiredNumber(dto.totalAmount, 'totalAmount'),
        totalCurrency: requiredString(dto.totalCurrency, 'totalCurrency'),
        lines: dto.lines.map(mapOrderLine),
    };
}
