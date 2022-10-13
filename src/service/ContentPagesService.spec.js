const httpClient = require('../utils/http-client');
const service = require('./ContentPagesService');
const data = require('./ContentPagesService.spec.data');

jest.mock('../../src/utils/http-client');

describe('ContentPagesService', () => {
    afterEach(() => {
        // Clear cache after each test
        service.invalidateContentCache();
    });
    describe('getContentUrl', () => {
        it('fills the cache when it is currently empty', async () => {
            const contentId = 123;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            await service.getContentUrl(contentId);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('does not fill the cache when it is not empty', async () => {
            const contentId = 123;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });
            await service.contentPagesGet(); // Prefill cache

            await service.getContentUrl(contentId);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('returns the correct URL', async () => {
            const contentId= data.fetchContents.data[1].id;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.getContentUrl(contentId.toString());

            expect(result).toEqual({ url: data.fetchContents.data[1].url });
        });
        it('returns null for invalid IDs', async () => {
            const contentId = -999;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.getContentUrl(contentId);

            expect(result).toEqual(null);
        });
    });
    describe('lookupContentUrl', () => {
        it('fills the cache when it is currently empty', async () => {
            const contentUrl = '/some-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            await service.lookupContentUrl(contentUrl);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('does not fill the cache when it is not empty', async () => {
            const contentUrl = '/some-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents });
            await service.contentPagesGet(); // Prefill cache

            await service.lookupContentUrl(contentUrl);

            expect(httpClient.get.mock.calls.length).toEqual(1);
        });
        it('returns the correct information', async () => {
            const contentUrl = data.fetchContents.data[1].url;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.lookupContentUrl(contentUrl);

            expect(result.id).toEqual(data.fetchContents.data[1].id);
            expect(result.type).toEqual('content');
        });
        it('returns an empty object for invalid URLS', async () => {
            const contentUrl = '/invalid-url/';
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.lookupContentUrl(contentUrl);

            expect(result).toEqual({});
        });
    });
    describe('invalidateContentCache', () => {
        it('clears the cache', async () => {
            const contentId = data.fetchContents.data[1].id;
            httpClient.get.mockResolvedValue({ data: data.fetchContents });
            await service.getContentUrl(contentId); // Prefill cache

            service.invalidateContentCache();

            await service.getContentUrl(contentId); // Fill it again if it was empty

            expect(httpClient.get.mock.calls.length).toEqual(2);
        });
    });
    describe('contentPagesContentIdsGet', () => {
        it('returns the content pages with the given IDs', async () => {
            const contentIds = [data.fetchContents.data[1].id, -999];
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.contentPagesContentIdsGet(contentIds);

            expect(result.contentPages.length).toEqual(1);
            expect(result.contentPages[0].id).toEqual(contentIds[0]);
        });
    });
    describe('contentPagesGet', () => {
        it('returns all content pages', async () => {
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.contentPagesGet();

            expect(result.contentPages.length).toEqual(data.fetchContents.data.length);
            expect(result.total).toEqual(data.fetchContents.data.length);
            expect(result.hasNext).toEqual(false);
        });
    });
    describe('createPagePayload', () => {
        it('creates the payload based on the given request body (with next sibling)', async () => {
            const body = {
                template: 'TEMPLATE',
                label: 'LABEL',
                visible: true,
                parentId: 123,
                nextSiblingId: 456
            };
            const sortOrder = 6;
            const nextSiblingResponse = { data: { sort_order: sortOrder } };
            httpClient.get.mockResolvedValue(nextSiblingResponse);

            const result = await service.createPagePayload(body);

            expect(httpClient.get.mock.calls[0][0]).toEqual(`/v3/content/pages/${body.nextSiblingId}`);
            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.label);
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
            expect(result.parent_id).toEqual(123);
            expect(result.sort_order).toEqual(sortOrder - 1);
        });
        it('creates the payload based on the given request body (without next sibling)', async () => {
            const body = {
                template: 'TEMPLATE',
                label: 'LABEL',
                visible: true,
                parentId: 123,
                nextSiblingId: undefined
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.label);
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
            expect(result.parent_id).toEqual(123);
        });
        it('creates the payload based on the given request body (without label)', async () => {
            const body = {
                template: 'TEMPLATE',
                label: undefined,
                visible: true,
                parentId: 123,
                nextSiblingId: undefined
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual(body.template);
            expect(result.is_homepage).toEqual(false);
            expect(result.is_visible).toEqual(true);
            expect(result.type).toEqual('page');
        });
        it('creates the payload based on the given request body (template is homepage)', async () => {
            const body = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: 123,
                nextSiblingId: undefined
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual('LABEL');
            expect(result.is_homepage).toEqual(true);
            expect(result.is_visible).toEqual(true);
            expect(result.type).toEqual('page');
        });
        it('creates the payload based on the given request body (no parent ID)', async () => {
            const body = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: undefined,
                nextSiblingId: undefined
            };

            const result = await service.createPagePayload(body);

            expect(result.type).toEqual('page');
            expect(result.name).toEqual('LABEL');
            expect(result.is_homepage).toEqual(true);
            expect(result.is_visible).toEqual(true);
            expect(result.parent_id).toEqual(undefined);
            expect(result.sort_order).toEqual(undefined);
        });
    });
    describe('contentPagesPost', () => {
        it('creates the page by sending a POST request', async () => {
            const body = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: undefined,
                nextSiblingId: undefined
            };
            const postResponse = { data: { data: { id: 123 } }, error: false };
            httpClient.post.mockResolvedValue(postResponse);
            const putResponse = { data: { data: { id: 123 } } };
            httpClient.put.mockResolvedValue(putResponse);

            const result = await service.contentPagesPost(body);

            expect(httpClient.post.mock.calls[0][0]).toEqual(`/v3/content/pages`);
            expect(httpClient.post.mock.calls[0][1].body).toEqual('');
            expect(httpClient.post.mock.calls[0][1].type).toEqual('page');
            expect(httpClient.post.mock.calls[0][1].name).toEqual('LABEL');
            expect(httpClient.post.mock.calls[0][1].is_homepage).toEqual(true);
            expect(httpClient.post.mock.calls[0][1].is_visible).toEqual(true);
            expect(httpClient.post.mock.calls[0][1].parent_id).toEqual(undefined);
            expect(httpClient.post.mock.calls[0][1].sort_order).toEqual(undefined);
            expect(httpClient.put.mock.calls[0][0]).toEqual(`/v3/content/pages/${postResponse.data.data.id}`);
            expect(result).toEqual(putResponse.data.data);
        });
        it('throws an error in case the request fails (no message on last error)', async () => {
            const body = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: undefined,
                nextSiblingId: undefined
            };
            const postResponse = { data: { data: { id: 123 } }, error: true };
            httpClient.post.mockResolvedValue(postResponse);
            const expectedError = 'ERROR';
            httpClient.getLastError.mockReturnValue(expectedError);

            await expect(service.contentPagesPost(body)).rejects.toThrow(expectedError);
            expect(httpClient.put.mock.calls.length).toEqual(0);
        });
        it('throws an error in case the request fails (with message on last error)', async () => {
            const body = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: undefined,
                nextSiblingId: undefined
            };
            const postResponse = { data: { data: { id: 123 } }, error: true };
            httpClient.post.mockResolvedValue(postResponse);
            const expectedError = 'ERROR';
            httpClient.getLastError.mockReturnValue({ response: { data: [{ message: expectedError }] } });

            await expect(service.contentPagesPost(body)).rejects.toThrow(expectedError);
            expect(httpClient.put.mock.calls.length).toEqual(0);
        });
    });
    describe('contentPagesContentIdPut', () => {
        it('edits the page by sending a PUT request', async () => {
            const contentId = 123;
            const payload = {
                template: 'homepage',
                label: 'LABEL',
                visible: true,
                parentId: undefined,
                nextSiblingId: undefined
            };

            await service.contentPagesContentIdPut(payload, 'EN', contentId);

            expect(httpClient.put.mock.calls[0][0]).toEqual(`/v3/content/pages/${contentId}`);
            expect(httpClient.put.mock.calls[0][1].type).toEqual('page');
            expect(httpClient.put.mock.calls[0][1].name).toEqual('LABEL');
            expect(httpClient.put.mock.calls[0][1].is_homepage).toEqual(true);
            expect(httpClient.put.mock.calls[0][1].is_visible).toEqual(true);
            expect(httpClient.put.mock.calls[0][1].parent_id).toEqual(undefined);
            expect(httpClient.put.mock.calls[0][1].sort_order).toEqual(undefined);
        });
        it.todo('throws an error in case the request fails');
    });
    describe('contentPagesContentIdDelete', () => {
        it('deletes the page by sending a DELETE request', async () => {
            const contentId = 123;

            await service.contentPagesContentIdDelete(contentId, 'EN');

            expect(httpClient.delete.mock.calls[0][0]).toEqual(`/v3/content/pages/${contentId}`);
        });
        it.todo('throws an error in case the request fails');
    });
});
