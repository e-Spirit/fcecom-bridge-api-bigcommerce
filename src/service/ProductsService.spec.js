const httpClient = require('../utils/http-client');
const data = require('./ProductsService.spec.data');
const service = require('./ProductsService');

jest.mock('../../src/utils/http-client');

describe('ProductsService', () => {
    describe('productsGet', () => {
        const categoryId = 456;
        const keyword = 'KEYWORD';
        const lang = 'EN';
        const page = 1;
        it('fetches product data and maps it to internal type', async () => {


            httpClient.get.mockResolvedValue({ data: data.fetchProducts, status: 200 });

            const result = await service.productsGet(categoryId, keyword, lang, page);

            expect(httpClient.get.mock.calls[0][0]).toContain(
                `/v3/catalog/products?page=${page}&include_fields=name%2Csku&include=primary_image&keyword=${keyword}&categories%3Ain=456`
            );
            expect(result.products.length).toEqual(data.fetchProducts.data.length);
            result.products.forEach((product, index) => {
                expect(product.id).toEqual(data.fetchProducts.data[index].id);
                expect(product.label).toEqual(data.fetchProducts.data[index].name);
                expect(product.extract).toEqual(data.fetchProducts.data[index].sku);
                expect(product.image).toEqual(data.fetchProducts.data[index].primary_image.url_standard);
            });
            expect(result.total).toEqual(data.fetchProducts.data.length);
            expect(result.hasNext).toEqual(
                data.fetchProducts.meta.pagination.current_page > data.fetchProducts.meta.pagination.total_pages
            );
        });
    });
    describe('productsProductIdsGet', () => {
        it('fetches product data by ID and maps it to internal type', async () => {
            const procutIds = [data.fetchProducts.data[0].id.toString(), '-999'];
            httpClient.get.mockResolvedValue({ data: data.fetchProducts, status: 200 });

            const result = await service.productsProductIdsGet(procutIds);

            expect(httpClient.get.mock.calls[0][0]).toContain(`/v3/catalog/products`);
            expect(result.products.length).toEqual(1);
            result.products.forEach((product, index) => {
                expect(product.id).toEqual(data.fetchProducts.data[index].id);
                expect(product.label).toEqual(data.fetchProducts.data[index].name);
                expect(product.extract).toEqual(data.fetchProducts.data[index].sku);
                expect(product.image).toEqual(data.fetchProducts.data[index].primary_image.url_standard);
            });
            expect(result.total).toEqual(1);
            expect(result.hasNext).toEqual(
                data.fetchProducts.meta.pagination.current_page > data.fetchProducts.meta.pagination.total_pages
            );
        });
    });
    describe('getProductUrl', () => {
        it('returns the correct URL', async () => {
            const productId = data.getProductUrl.data.id;
            httpClient.get.mockResolvedValue({ data: data.getProductUrl, status: 200 });

            const result = await service.getProductUrl(productId);

            expect(httpClient.get.mock.calls[0][0]).toEqual(`/v3/catalog/products/${productId}?include_fields=custom_url`);
            expect(result).toEqual({ url: data.getProductUrl.data.custom_url.url });
        });
    });
});
