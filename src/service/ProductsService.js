const { getNumber } = require('fcecom-bridge-commons');
const httpClient = require('../utils/http-client');
const logger = require('../utils/logger');

const LOGGING_NAME = 'ProductsService';

/**
 * This method fetches all products and transforms them into the internal model.
 *
 * @param {number} [categoryId] ID of the category to get products from.
 * @param {string} [keyword] Keyword to filter the products by.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return The fetched products.
 */
const productsGet = async (categoryId, keyword, lang, page = 1) => {
    categoryId = categoryId && getNumber(categoryId, 'categoryId');

    const searchParams = new URLSearchParams({
        page,
        include_fields: 'name,sku',
        include: 'primary_image',
        ...(keyword && { keyword }),
        ...(categoryId && { 'categories:in': categoryId })
    });

    logger.logDebug(LOGGING_NAME, `Performing GET request to /v3/catalog/products with parameters ${searchParams}`);

    const { data: { data = [], meta = {} } = {} } = await httpClient.get(`/v3/catalog/products?${searchParams}`);
    const { total = 0, current_page = 0, total_pages = 0 } = meta.pagination || {};
    const products = data.map(({ id, name: label, sku: extract, primary_image: { url_thumbnail: thumbnail, url_standard: image } }) => {
        return { id, label, extract, thumbnail, image };
    });

    return { products, total, hasNext: current_page < total_pages };
};

/**
 * This method fetches the data for the products with the given IDs.
 * @see SwaggerUI {@link http://localhost:3000/api/#/Products/productsProductIdsGet}
 *
 * @param {string[]} [productIds] IDs of the categories to get.
 * @return Promise<{ hasNext: boolean, total: number, products: any[]}> The category data.
 */
const productsProductIdsGet = async (productIds) => {
    productIds = productIds
        .map((id) => parseInt(id) || null) // Parse IDs to numbers
        .filter((id) => id !== null); // Ignore invalid numbers

    const result = await productsGet();

    const products = result.products.filter((product) => {
        return productIds.includes(product.id);
    });

    return { products, total: products.length, hasNext: false };
};

/**
 * This method returns the URL for the given product.
 *
 * @param {number} productId The ID of the product to get the URL for.
 * @return {{url: string}} The URL of the given product, null if given ID is invalid.
 */
const getProductUrl = async (productId) => {
    productId = getNumber(productId, 'productId');
    logger.logDebug(LOGGING_NAME, `Performing GET request to /v3/catalog/products with parameters ${productId}?include_fields=custom_url`);

    const { data = {} } = await httpClient.get(`/v3/catalog/products/${productId}?include_fields=custom_url`);
    const url = data.data?.custom_url?.url;
    return url ? { url } : null;
};

module.exports = {
    productsGet,
    productsProductIdsGet,
    getProductUrl
};
