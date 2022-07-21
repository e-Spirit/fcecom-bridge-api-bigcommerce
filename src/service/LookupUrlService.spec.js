const httpClient = require('../utils/http-client');
const service = require('./LookupUrlService');
const ContentPages = require('./ContentPagesService');

jest.mock('../../src/utils/http-client');
jest.mock('../../src/service/ContentPagesService');

describe('LookupUrlCtrl', () => {
    describe('lookup', () => {
        it('returns an identifier (looked up via GQL)', async () => {
            const url = '/SOME-URL/';
            const gqlResponse = { data: { data: { site: { route: { node: { entityId: 'SOME_ID', __typename: 'TYPENAME' } } } } } };
            httpClient.gql.mockResolvedValue(gqlResponse);
            const lookupContentUrlResponse = { id: '/SOME-URL-ID/', type: 'content' };
            ContentPages.lookupContentUrl.mockResolvedValue(lookupContentUrlResponse);

            const result = await service.lookup(url);

            expect(ContentPages.lookupContentUrl.mock.calls.length).toEqual(0); // Does not query ContentsCtrl
            expect(httpClient.gql.mock.calls[0][0]).toContain('#graphql');
            expect(httpClient.gql.mock.calls[0][0]).toContain(`route(path: "${url}")`);
            expect(httpClient.gql.mock.calls[0][0]).toContain('...on Category { entityId }');
            expect(httpClient.gql.mock.calls[0][0]).toContain('...on Product { entityId }');
            expect(result).toEqual({
                id: 'SOME_ID',
                type: 'typename'
            });
        });
        it('returns an identifier (looked up via ContentsCtrl if not found via GQL)', async () => {
            const url = '/SOME-URL/';
            const gqlResponse = { data: {} };
            httpClient.gql.mockResolvedValue(gqlResponse);
            const lookupContentUrlResponse = { id: '/SOME-URL-ID/', type: 'content' };
            ContentPages.lookupContentUrl.mockResolvedValue(lookupContentUrlResponse);

            const result = await service.lookup(url);

            expect(ContentPages.lookupContentUrl.mock.calls.length).toEqual(1);
            expect(ContentPages.lookupContentUrl.mock.calls[0][0]).toEqual(url);
            expect(httpClient.gql.mock.calls.length).toEqual(1);
            expect(result).toEqual(lookupContentUrlResponse);
        });
        it('returns an empty object (if not found via GQL or ContentsCtrl)', async () => {
            const url = '/SOME-URL/';
            const gqlResponse = { data: {} };
            httpClient.gql.mockResolvedValue(gqlResponse);
            const lookupContentUrlResponse = null;
            ContentPages.lookupContentUrl.mockResolvedValue(lookupContentUrlResponse);

            const result = await service.lookup(url);

            expect(ContentPages.lookupContentUrl.mock.calls.length).toEqual(1);
            expect(httpClient.gql.mock.calls.length).toEqual(1);
            expect(result).toEqual({});
        });
        it('returns an empty object (if no URL is provided)', async () => {
            const url = undefined;
            const gqlResponse = { data: {} };
            httpClient.gql.mockResolvedValue(gqlResponse);
            const lookupContentUrlResponse = null;
            ContentPages.lookupContentUrl.mockResolvedValue(lookupContentUrlResponse);

            const result = await service.lookup(url);

            expect(ContentPages.lookupContentUrl.mock.calls.length).toEqual(0);
            expect(httpClient.gql.mock.calls.length).toEqual(0);
            expect(result).toEqual({});
        });
    });
});
