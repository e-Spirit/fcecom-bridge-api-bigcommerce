const httpClient = require('../utils/http-client');
const data = require('./CategoriesService.spec.data');
const service = require('./CategoriesService');

jest.mock('../../src/utils/http-client');

describe('CategoriesService', () => {
    describe('getCategoryUrl', () => {
        it('returns the URL of the given category', async () => {
            const categoryId= data.categoriesGet.data[0].id;
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.getCategoryUrl(categoryId.toString());

            expect(result).toEqual({ url: data.categoriesGet.data[0].custom_url.url });
            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
        });
        it('returns null if the given category is invalid', async () => {
            console.error = jest.fn();
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.getCategoryUrl(-999);

            expect(result).toEqual(null);
            expect(console.error).toHaveBeenCalled();
        });
    });
    describe('categoriesGet', () => {
        it('returns the categories as list (no parent ID, no pagination)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoriesGet();

            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
            expect(result.categories.length).toEqual(data.categoriesGet.data.length);
            for (let i = 0; i < data.categoriesGet.data.length; i++) {
                // Check if every category from the test data set is present in the result (ignore ordering)
                expect(result.categories.findIndex((category) => category.id === data.categoriesGet.data[i].id) !== -1).toEqual(true);
            }
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoriesGet.data.length);
        });
        it('returns the categories as list (with parent ID)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoriesGet(data.categoriesGet.data[0].id);

            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
            expect(result.categories.length).toEqual(3);
            expect(result.categories[0].id).toEqual(19);
            expect(result.categories[1].id).toEqual(21);
            expect(result.categories[2].id).toEqual(22);
        });
        it('returns the categories as list (with pagination)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoriesGet(0, 'EN', 123);

            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
            expect(result.categories.length).toEqual(0);
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoriesGet.data.length);
        });
    });
    describe('categoryTreeGet', () => {
        it('returns the categories as tree (no parent ID)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoryTreeGet();

            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
            expect(result.categorytree[0].id).toEqual(23);
            expect(result.categorytree[1].id).toEqual(18);
            expect(result.categorytree[1].children[0].id).toEqual(19);
            expect(result.categorytree[1].children[1].children[0].id).toEqual(22);
            expect(result.categorytree[1].children[1].id).toEqual(21);
            expect(result.categorytree[2].id).toEqual(20);
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoriesGet.data.length);
        });
        it('returns the categories as tree (with parent ID)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoryTreeGet(data.categoriesGet.data[0].id);

            expect(httpClient.get.mock.calls[0][0]).toEqual(
                '/v3/catalog/categories?include_fields=id%2Cparent_id%2Cname%2Csort_order%2Ccustom_url&limit=250'
            );
            expect(result.categorytree[0].id).toEqual(19);
            expect(result.categorytree[1].id).toEqual(21);
            expect(result.categorytree[1].children[0].id).toEqual(22);
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoriesGet.data.length);
        });
    });

    describe('categoriesCategoryIdsGet', () => {
        it('returns the categories pages with the given IDs', async () => {
            const categoryIds = [data.categoriesGet.data[1].id, -999];
            httpClient.get.mockResolvedValue({ data: data.categoriesGet });

            const result = await service.categoriesCategoryIdsGet(categoryIds);

            expect(result.categories.length).toEqual(1);
            expect(result.categories[0].id).toEqual(categoryIds[0]);
            expect(result.total).toEqual(1);
        });
    });
});
