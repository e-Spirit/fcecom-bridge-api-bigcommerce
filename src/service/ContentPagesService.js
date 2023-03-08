const { getNumber } = require('fcecom-bridge-commons');
const httpClient = require('../utils/http-client');
const logger = require('../utils/logger');

const LOGGING_NAME = 'ContentPagesService';

// Map to cache content IDs in order to resolve their URLs later
const idCache = new Map();

/**
 * This method transforms the given data into the payload to send to the BigCommerce API when creating or editing content pages.
 *
 * The payload parameter may contain the following properties:
 * - {string} template The name of the template to use.
 * - {string} label The label of the page.
 * - {boolean} visible Whether the page is visible.
 * - {number} [parentId] ID of the parent page (optional).
 * - {number} [nextSiblingId] ID of the next sibling (optional).
 *
 * @param {object} payload Payload to transform containing the properties mentioned above.
 * @return The payload to send to the BigCommerce API.
 */
const createPagePayload = async ({ template, label, visible, parentId, nextSiblingId }) => {
    let sort_order;
    if (nextSiblingId) {
        const { data: page = {} } = await httpClient.get(`/v3/content/pages/${nextSiblingId}`);
        sort_order = page.sort_order && page.sort_order - 1;
    }

    const payload = {
        type: 'page',
        name: label || template,
        is_homepage: template === 'homepage',
        is_visible: visible === true,
        ...(parentId && { parent_id: +parentId }),
        ...(sort_order && { sort_order })
    };

    return payload;
};

/**
 * This method creates a page using the BigCommerce API.
 *
 * @param {object} payload Payload created using `createPagePayload`.
 * @return {*} The response data received from the BigCommerce API.
 */
const contentPagesPost = async (payload) => {
    payload = await createPagePayload(payload);

    logger.logDebug(LOGGING_NAME, `Performing POST request to /v3/content/pages with parameters ${JSON.stringify(payload)}`);

    const {
        data: { data: page = {} },
        error = false
    } = await httpClient.post(`/v3/content/pages`, { ...payload, body: '' });
    if (error) {
        throw new Error(httpClient.getLastError().response?.data?.[0]?.message || `${httpClient.getLastError()}`);
    } else {
        invalidateContentCache();
        const body = `<code style="background-color:#eee;padding:0.2em 0.5em;border:1px solid #bbb;border-radius:3px">&lt;caas-content content="${page.id}" /&gt;</code>`;

        logger.logDebug(LOGGING_NAME, `Performing PUT request to /v3/content/pages/${page.id} with body ${JSON.stringify(body)}`);

        const { data: response } = await httpClient.put(`/v3/content/pages/${page.id}`, {
            body: body
        });
        return response.data;
    }
};

/**
 * This method moves or renames a page using the BigCommerce API.
 *
 * @param {string} [lang] The language of the request.
 * @param {object} payload Payload created using `createPagePayload` containing the new values.
 * @param {number} contentId ID of the page to move or rename.
 */
const contentPagesContentIdPut = async (payload, lang, contentId) => {
    contentId = getNumber(contentId, 'contentId');
    payload = await createPagePayload(payload);

    logger.logDebug(LOGGING_NAME, `Performing PUT request to /v3/content/pages/${contentId} with body ${JSON.stringify(payload)}`);

    await httpClient.put(`/v3/content/pages/${contentId}`, payload);
    invalidateContentCache();
};

/**
 * This method deletes the page with the given ID.
 *
 * @param {string} lang The language of the request.
 * @param {number} contentId ID of the page to delete.
 */
const contentPagesContentIdDelete = async (contentId, lang) => {
    contentId = getNumber(contentId, 'contentId');

    logger.logDebug(LOGGING_NAME, `Performing DELETE request to /v3/content/pages/${contentId}`);

    await httpClient.delete(`/v3/content/pages/${contentId}`);
    invalidateContentCache();
};

/**
 * This method returns all content pages.
 * Will also update the cache with the latest values.
 *
 * @param {string} query Query string to search pages for.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return An array containing all content pages.
 */
const contentPagesGet = async (query, lang, page) => {
    const searchParams = new URLSearchParams({
        ...(page && { page }),
        ...(query && { 'name:like': query }),
        limit: 250
    });

    logger.logDebug(LOGGING_NAME, `Performing GET request to /v3/content/pages/ with parameters ${searchParams}`);

    const {
        data: { data }
    } = await httpClient.get(`/v3/content/pages?${searchParams}`);
    data.forEach(({ id, url }) => url && (idCache.set(`${id}`, url), idCache.set(url, id)));
    idCache.set('/', '/'); // Homepage

    const contentPages = data.map(({ id, name: label, url: extract }) => ({ id, label, extract }));

    return { contentPages, total: contentPages.length, hasNext: false };
};

/**
 * This method returns the content pages with the given IDs.
 * Will ignore invalid IDs.
 *
 * @param {number[]} contentIds Array of IDs of content pages to get.
 * @return {[*]} The content pages for the given IDs.
 */
const contentPagesContentIdsGet = async (contentIds) => {
    contentIds = contentIds
        .map((id) => parseInt(id) || null) // Parse IDs to numbers
        .filter((id) => id !== null); // Ignore invalid numbers

    const { contentPages } = await contentPagesGet();
    return {
        contentPages: contentPages.filter(({ id }) => contentIds.includes(id))
    };
};

/**
 * This method clears the cache.
 * Should be called after creating, editing or deleting pages.
 */
const invalidateContentCache = () => {
    logger.logDebug(LOGGING_NAME, 'Invalidated content cache');

    idCache.clear();
};

/**
 * This methood returns information belonging to the content page with the given URL.
 *
 * @param {string} contentUrl URL of the content page to get information for.
 * @return {{id: string, type: string}} The information belonging to the page with the given URL, empty object for invalid URLs.
 */
const lookupContentUrl = async (contentUrl) => {
    idCache.size || (await contentPagesGet());
    return idCache.has(contentUrl) ? { id: idCache.get(contentUrl), type: 'content' } : {};
};

/**
 * This method returns the URL belonging to the page with the given ID.
 *
 * @param {number} contentId ID of the page.
 * @return {{url: string}} The URL belonging to the page, null if page ID was invalid.
 */
const getContentUrl = async (contentId) => {
    idCache.size || (await contentPagesGet());
    return idCache.get(contentId) ? { url: idCache.get(contentId) } : null;
};

module.exports = {
    contentPagesPost,
    createPagePayload,
    contentPagesContentIdDelete,
    contentPagesGet,
    contentPagesContentIdsGet,
    invalidateContentCache,
    lookupContentUrl,
    getContentUrl,
    contentPagesContentIdPut
};
