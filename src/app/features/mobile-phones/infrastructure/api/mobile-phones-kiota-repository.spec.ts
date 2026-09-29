import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogProductsNotFoundError } from '../../domain/model/catalog-products-not-found.error';
import { MobilePhonesKiotaRepository } from './mobile-phones-kiota-repository';

const productId = '11111111-1111-1111-1111-111111111111';

describe('MobilePhones Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('posts the requested IDs to the BFF and maps catalog products', async () => {
        let requestBody = '';
        vi.stubGlobal('fetch', vi.fn(async (_url: string, request: RequestInit) => {
            requestBody = typeof request.body === 'string' ? request.body :
                new TextDecoder().decode(request.body as Uint8Array);
            return new Response(JSON.stringify([{ id: productId, name: 'Phone', price: {
                amount: 125.5, currency: 'EUR',
            } }]), { status: 200, headers: { 'content-type': 'application/json' } });
        }));

        const result = await firstValueFrom(new MobilePhonesKiotaRepository().getByIds([productId]));

        expect(JSON.parse(requestBody)).toEqual([productId]);
        expect(result[0]).toMatchObject({ id: productId, name: 'Phone', price: { amount: 125.5, currency: 'EUR' } });
    });

    it('maps a Kiota 404 into a catalog not-found error', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(
            JSON.stringify({ status: 404, title: 'Not Found' }),
            { status: 404, headers: { 'content-type': 'application/problem+json' } }
        )));

        await expect(firstValueFrom(new MobilePhonesKiotaRepository().getByIds([productId])))
            .rejects.toBeInstanceOf(CatalogProductsNotFoundError);
    });
});
