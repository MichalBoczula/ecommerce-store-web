import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogProductsNotFoundError } from '../../domain/model/catalog-products-not-found.error';
import { MobilePhonesKiotaRepository } from './mobile-phones-kiota-repository';

const productId = '11111111-1111-1111-1111-111111111111';
const mainPhoto = 'https://photos.example.com/phones/Apple%20iPhone%2016%20Bia%C5%82y/Main.webp';

describe('MobilePhones Kiota repository', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('posts the requested IDs to the BFF and maps catalog products', async () => {
        let requestBody = '';
        vi.stubGlobal('fetch', vi.fn(async (_url: string, request: RequestInit) => {
            requestBody = typeof request.body === 'string' ? request.body :
                new TextDecoder().decode(request.body as Uint8Array);
            return new Response(JSON.stringify([{ id: productId, name: 'Phone', mainPhoto, price: {
                amount: 125.5, currency: 'EUR',
            } }]), { status: 200, headers: { 'content-type': 'application/json' } });
        }));

        const result = await firstValueFrom(new MobilePhonesKiotaRepository().getByIds([productId]));

        expect(JSON.parse(requestBody)).toEqual([productId]);
        expect(result[0]).toMatchObject({ id: productId, name: 'Phone', mainPhoto, price: { amount: 125.5, currency: 'EUR' } });
    });

    it.each(['list', 'filter'] as const)('keeps the API mainPhoto URL when reading the %s', async operation => {
        const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response(JSON.stringify([
            { id: productId, name: 'Phone', mainPhoto },
        ]), { status: 200, headers: { 'content-type': 'application/json' } }));
        vi.stubGlobal('fetch', fetch);
        const repository = new MobilePhonesKiotaRepository();

        const result = await firstValueFrom(operation === 'list'
            ? repository.getAll(15)
            : repository.getFilteredMobilePhones({ brand: 'Apple' }));

        expect(result[0].mainPhoto).toBe(mainPhoto);
        expect(String(fetch.mock.calls[0][0])).toContain(operation === 'list'
            ? '/backend/mobile-phones?amount=15'
            : '/backend/mobile-phones/filter');
    });

    it('maps a missing mainPhoto to null for the unavailable-photo state', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
            { id: productId, name: 'Phone' },
        ]), { status: 200, headers: { 'content-type': 'application/json' } })));

        const result = await firstValueFrom(new MobilePhonesKiotaRepository().getAll(1));

        expect(result[0].mainPhoto).toBeNull();
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
