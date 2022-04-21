const httpClient = require('../utils/http-client');
const ContentPages = require('./ContentPagesService');

/**
 * This method returns the identifier for the given storefront URL.
 *
 * @param {string} url The storefront URL to look up.
 * @return {{id?: string, type?: string}} The identifier belonging to the given URL. 
 */
const lookup = async (url) => {
  let ecomId;

  if (url) {
    const { data = {} } = await httpClient.gql(`#graphql
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
      }`);
    const node = data.data?.site?.route?.node;
    ecomId = node ? { id: node.entityId, type: node.__typename.toLowerCase() } : await ContentPages.lookupContentUrl(url);
  }
  return ecomId || {};
};

module.exports = {
  lookup
};