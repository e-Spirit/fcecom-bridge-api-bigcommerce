const ContentPages = require('./ContentService');
const Categories = require('./CategoriesService');
const Products = require('./ProductsService');
const LookupUrlService = require('./LookupUrlService');
const { getNumber } = require('fcecom-bridge-commons');

/**
 * This method returns an identifier for a given Storefront URL which is used in FirstSpirit to identify the page.
 *
 * @param {string} url The Storefront URL to look up.
 * @returns {object} The identifier for the given URL.
 */
const lookupUrlGet = async function (url) {
    return await LookupUrlService.lookup(url);
};

/**
 * This method returns a Storefront URL which is build out of the given identifier properties in FirstSpirit.
 *
 * @param {string} type The element type.
 * @param {number} id The element's unique Identifier.
 * @param {string} [lang] The language to localize the label.
 * @returns The Storefront URL belonging to the given element.
 */
const storefrontUrlGet = async function (type, id, lang) {
    id = getNumber(id, 'id');
    const url = await (type === 'category'
        ? Categories.getCategoryUrl(id)
        : type === 'product'
        ? Products.getProductUrl(id)
        : ContentPages.getContentUrl(id));

    return url;
};

module.exports = {
    lookupUrlGet,
    storefrontUrlGet
};
