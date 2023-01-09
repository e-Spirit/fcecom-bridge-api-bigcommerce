const httpClient = require('../utils/http-client');

// Map to cache content IDs in order to resolve their URLs later
const idCache = new Map();

/**
 * This method transforms the given data into the payload to send to the BigCommerce API when creating or editing content pages.
 *
 * The payload parameter may contain the following properties:
 * - {string} template The name of the template to use.
 * - {string} label The label of the page.
 * - {boolean} released Whether the page is visible.
 *
 * @param {object} payload Payload to transform containing the properties mentioned above.
 * @return The payload to send to the BigCommerce API.
 */
const createPagePayload = async ({ template, label, released, path }) => {
    if (label) {
        label = label[Object.keys(label)[0]];
    }
    if (path) {
        path = path[Object.keys(path)[0]];
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
    }

    return {
        type: 'page',
        name: label || template,
        is_homepage: template === 'homepage',
        is_visible: released === true,
        url: path
    };
};

/**
 * This method creates a page using the BigCommerce API.
 *
 * @param {object} payload Payload created using `createPagePayload`.
 * @return {*} The response data received from the BigCommerce API.
 */
const contentPost = async (payload) => {
    payload = await createPagePayload(payload);

    const {
        data: { data: page = {} },
        error = false
    } = await httpClient.post(`/v3/content/pages`, { ...payload, body: '' });
    if (error) {
        throw new Error(httpClient.getLastError().response?.data?.[0]?.message || `${httpClient.getLastError()}`);
    } else {
        invalidateContentCache();
        const { data: response } = await httpClient.put(`/v3/content/pages/${page.id}`, {
            body: `<code style="background-color:#eee;padding:0.2em 0.5em;border:1px solid #bbb;border-radius:3px">&lt;caas-content content="${page.id}" /&gt;</code>`
        });
        return { id: response.data.id };
    }
};

/**
 * This method moves or renames a page using the BigCommerce API.
 *
 * @param {number} contentId ID of the page to move or rename.
 * @param {object} payload Payload created using `createPagePayload` containing the new values.
 */
const contentContentIdPut = async (payload, contentId) => {
    payload = await createPagePayload(payload);
    await httpClient.put(`/v3/content/pages/${contentId}`, payload);
    invalidateContentCache();
};

/**
 * This method deletes the page with the given ID.
 *
 * @param {number} contentId ID of the page to delete.
 */
const contentContentIdDelete = async (contentId) => {
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
const contentGet = async (query, lang, page) => {
    const searchParams = new URLSearchParams({
        ...(page && { page }),
        ...(query && { 'name:like': query }),
        limit: 250
    });
    const {
        data: { data },
    } = await httpClient.get(`/v3/content/pages?${searchParams}`);
    data.forEach(({ id, url }) => url && (idCache.set(`${id}`, url), idCache.set(url, id)));
    idCache.set('/', '/'); // Homepage

    const content = data.map(({ id, name: label, url: extract }) => ({ id, label, extract }));

    return { content, total: content.length, hasNext: false };
};

/**
 * This method returns the content pages with the given IDs.
 * Will ignore invalid IDs.
 *
 * @param {number[]} contentIds Array of IDs of content pages to get.
 * @return {[*]} The content pages for the given IDs.
 */
const contentContentIdsGet = async (contentIds) => {
    contentIds = contentIds
        .map((id) => parseInt(id) || null) // Parse IDs to numbers
        .filter((id) => id !== null); // Ignore invalid numbers

    const { content } = await contentGet();
    return {
        content: content.filter(({ id }) => contentIds.includes(id))
    };
};

/**
 * This method clears the cache.
 * Should be called after creating, editing or deleting pages.
 */
const invalidateContentCache = () => {
    idCache.clear();
};

/**
 * This methood returns information belonging to the content page with the given URL.
 *
 * @param {string} contentUrl URL of the content page to get information for.
 * @return {{id: string, type: string}} The information belonging to the page with the given URL, empty object for invalid URLs.
 */
const lookupContentUrl = async (contentUrl) => {
    idCache.size || (await contentGet());
    return idCache.has(contentUrl) ? { id: idCache.get(contentUrl), type: 'content' } : {};
};

/**
 * This method returns the URL belonging to the page with the given ID.
 *
 * @param {number} contentId ID of the page.
 * @return {{url: string}} The URL belonging to the page, null if page ID was invalid.
 */
const getContentUrl = async (contentId) => {
    idCache.size || (await contentGet());
    return idCache.get(contentId) ? { url: idCache.get(contentId) } : null;
};

module.exports = {
    contentPost,
    createPagePayload,
    contentContentIdDelete,
    contentGet,
    contentContentIdsGet,
    invalidateContentCache,
    lookupContentUrl,
    getContentUrl,
    contentContentIdPut
};
