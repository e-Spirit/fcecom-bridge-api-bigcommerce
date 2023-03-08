const httpClient = require('../utils/http-client');
const ContentPages = require('./ContentPagesService');
const logger = require('../utils/logger');

const LOGGING_NAME = 'LookupUrlService';

/**
 * This method returns the identifier for the given storefront URL.
 *
 * @param {string} url The storefront URL to look up.
 * @return {{id?: string, type?: string}} The identifier belonging to the given URL.
 */
const lookup = async (url) => {
    let ecomId;
    const gqlQuery = `#graphql
    query {
      site {
        route(path: "${url}") {
          node {
            __typename
            ...on Category { entityId }
            ...on Product { entityId }
          }
        }
      }
    }`;
    logger.logDebug(LOGGING_NAME, `Performing GQL request with query ${gqlQuery}`);

    if (url) {
        const { data = {} } = await httpClient.gql(gqlQuery);
        const node = data.data?.site?.route?.node;
        ecomId = node ? { id: node.entityId, type: node.__typename.toLowerCase() } : await ContentPages.lookupContentUrl(url);
    }
    return ecomId || {};
};

module.exports = {
    lookup
};
