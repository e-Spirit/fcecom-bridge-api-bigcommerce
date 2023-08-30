const httpClient = require('../utils/http-client');
const service = require('./ContentService');
const data = require('./ContentService.spec.data');

jest.mock('../../src/utils/http-client');

describe('ContentService', () => {
    afterEach(() => {
        // Clear cache after each test
        service.invalidateContentCache();
    });
    describe('getContentUrl', () => {
        it('fills the cache when it is currently empty', async () => {
            const contentId = 123;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            await service.getContentUrl(contentId);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('does not fill the cache when it is not empty', async () => {
            const contentId = 123;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });
            await service.contentGet(); // Prefill cache

            await service.getContentUrl(contentId);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('returns the correct URL', async () => {
            const contentId= data.fetchContents.data[1].id;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.getContentUrl(contentId.toString());

            expect(result).toEqual({ url: data.fetchContents.data[1].url });
        });
        it('returns null for invalid IDs', async () => {
            const contentId = -999;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.getContentUrl(contentId);

            expect(result).toEqual(null);
        });
    });
    describe('lookupContentUrl', () => {
        it('fills the cache when it is currently empty', async () => {
            const contentUrl = '/some-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            await service.lookupContentUrl(contentUrl);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('does not fill the cache when it is not empty', async () => {
            const contentUrl = '/some-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });
            await service.contentGet(); // Prefill cache

            await service.lookupContentUrl(contentUrl);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('returns the correct information', async () => {
            const contentUrl = data.fetchContents.data[1].url;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.lookupContentUrl(contentUrl);

            expect(result.id).toEqual(data.fetchContents.data[1].id);
            expect(result.type).toEqual('content');
        });
        it('returns an empty object for invalid URLS', async () => {
            const contentUrl = '/invalid-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.lookupContentUrl(contentUrl);

            expect(result).toEqual({});
        });
    });
    describe('invalidateContentCache', () => {
        it('clears the cache', async () => {
            const contentId = data.fetchContents.data[1].id;
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });
            await service.getContentUrl(contentId); // Prefill cache

            service.invalidateContentCache();

            await service.getContentUrl(contentId); // Fill it again if it was empty

            expect(httpClient.get.mock.calls.length).toEqual(2);
        });
    });
    describe('contentContentIdsGet', () => {
        it('returns the content pages with the given IDs', async () => {
            const contentIds = [data.fetchContents.data[1].id, -999];
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.contentContentIdsGet(contentIds);

            expect(result.content.length).toEqual(1);
            expect(result.content[0].id).toEqual(contentIds[0]);
        });
    });
    describe('contentGet', () => {
        it('returns all content pages', async () => {
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.contentGet();

            expect(result.content.length).toEqual(data.fetchContents.data.length);
            expect(result.total).toEqual(data.fetchContents.data.length);
            expect(result.hasNext).toEqual(false);
        });
    });
    describe('createPagePayload', () => {
        it('creates the payload based on the given request body', async () => {
            const body = {
                template: 'TEMPLATE',
                label: {
                    en: 'LABEL'
                },
                path: {
                    en: '/path/to/en'
                },
                released: true,
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.label.en);
            expect(result.url).toEqual(body.path.en);
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
        });
        it('creates the payload based on the given request body (without label)', async () => {
            const body = {
                template: 'TEMPLATE',
                label: undefined,
                path: {
                    en: '/path/to/en'
                },
                released: true,
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.template);
            expect(result.url).toEqual(body.path.en);
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
            expect(result.type).toEqual('page');
        });
        it('creates the payload based on the given request body (without path)', async () => {
            const body = {
                template: 'TEMPLATE',
                label: {
                    en: 'LABEL'
                },
                path: undefined,
                released: true,
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.label.en);
            expect(result.url).toBeUndefined()
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
        });
        it('creates the payload based on the given request body (template is homepage)', async () => {
            const body = {
                template: 'homepage',
                label: {
                    en: 'LABEL'
                },
                path: {
                    en: '/path/to/en'
                },
                released: true,
            };

            const result = await service.createPagePayload(body);

            expect(result.name).toEqual(body.label.en);
            expect(result.url).toEqual(body.path.en);
            expect(result.is_homepage).toEqual(true);
            expect(result.is_visible).toEqual(true);
            expect(result.type).toEqual('page');
        });
    });
    describe('contentPost', () => {
        const body = {
            template: 'homepage',
            label: {
                en: 'LABEL'
            },
            path: {
                en: '/path/to/en'
            },
            released: true,
        };
        it('creates the page by sending a POST request', async () => {
            const postResponse = { data: { data: { id: 123 } }, error: false, status: 200 };
            httpClient.post.mockResolvedValue(postResponse);
            const putResponse = { data: { data: { id: 123 } }, status: 200 };
            httpClient.put.mockResolvedValue(putResponse);

            const result = await service.contentPost(body);

            expect(httpClient.post.mock.calls[0][0]).toEqual(`/v3/content/pages`);
            expect(httpClient.post.mock.calls[0][1].body).toEqual('');
            expect(httpClient.post.mock.calls[0][1].type).toEqual('page');
            expect(httpClient.post.mock.calls[0][1].name).toEqual('LABEL');
            expect(httpClient.post.mock.calls[0][1].is_homepage).toEqual(true);
            expect(httpClient.post.mock.calls[0][1].is_visible).toEqual(true);
            expect(httpClient.put.mock.calls[0][0]).toEqual(`/v3/content/pages/${postResponse.data.data.id}`);
            expect(result).toEqual(putResponse.data.data);
        });
        it('throws an error in case the request fails (no message on last error)', async () => {
            const postResponse = { data: { data: { id: 123 } }, error: true };
            httpClient.post.mockResolvedValue(postResponse);
            const expectedError = 'ERROR';
            httpClient.getLastError.mockReturnValue(expectedError);

            await expect(service.contentPost(body)).rejects.toThrow(expectedError);
            expect(httpClient.put.mock.calls.length).toEqual(0);
        });
        it('throws an error in case the request fails (with message on last error)', async () => {
            const postResponse = { data: { data: { id: 123 } }, error: true };
            httpClient.post.mockResolvedValue(postResponse);
            const expectedError = 'ERROR';
            httpClient.getLastError.mockReturnValue({ response: { data: [{ message: expectedError }] } });

            await expect(service.contentPost(body)).rejects.toThrow(expectedError);
            expect(httpClient.put.mock.calls.length).toEqual(0);
        });
    });
    describe('contentContentIdPut', () => {
        const contentId = 123;
        const payload = {
            template: 'homepage',
            label: {
                en: 'LABEL'
            },
            path: {
                en: '/path/to/en'
            },
            released: true,
        };
        it('edits the page by sending a PUT request', async () => {

            const testResponse = { data: {} , status: 200 };
            httpClient.put.mockResolvedValue(testResponse);

            await service.contentContentIdPut(payload, contentId);

            expect(httpClient.put.mock.calls[0][0]).toEqual(`/v3/content/pages/${contentId}`);
            expect(httpClient.put.mock.calls[0][1].type).toEqual('page');
            expect(httpClient.put.mock.calls[0][1].name).toEqual('LABEL');
            expect(httpClient.put.mock.calls[0][1].is_homepage).toEqual(true);
            expect(httpClient.put.mock.calls[0][1].is_visible).toEqual(true);
        });
    });
    describe('contentContentIdDelete', () => {
        it('deletes the page by sending a DELETE request', async () => {
            const testResponse = { data: {} , status: 200 };
            httpClient.delete.mockResolvedValue(testResponse);

            const contentId = 123;

            await service.contentContentIdDelete(contentId);

            expect(httpClient.delete.mock.calls[0][0]).toEqual(`/v3/content/pages/${contentId}`);
        });
    });
});
