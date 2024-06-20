const { getNumber } = require('fcecom-bridge-commons');
const httpClient = require('../utils/http-client');
const logger = require('../utils/logger');

const LOGGING_NAME = 'CategoriesService';

const LIMIT = 50;

// Map to cache category IDs in order to resolve their URLs later
const idCache = new Map();

/**
 * This method fetches all categories by recursively fetching all pages.
 *
 * @return {any[]} List of all categories.
 */
const fetchCategories = async () => {
    // Fetch all categories by querying all pages
    const fetchCategoriesRecursive = async (page = 0, current = []) => {
        const searchParams = new URLSearchParams({
            include_fields: 'id,parent_id,name,sort_order,custom_url',
            limit: 250, // Use max limit BigCommerce allows in order to have as few requests as possible
            ...(page && { page })
        });
        logger.logDebug(LOGGING_NAME, `Performing GET request to /v3/catalog/categories with parameters ${searchParams}`);
        const { data: { data: categories = [], meta: { pagination } = {} } = {} } = await httpClient.get(
            `/v3/catalog/categories?${searchParams}`
        );

        current.push(...categories);
        if (pagination.current_page === pagination.total_pages) {
            return current.filter((category, index) => current.findIndex((category2) => category.id === category2.id) === index);
        }

        return await fetchCategoriesRecursive(page + 1, current);
    };

    const categories = await fetchCategoriesRecursive();

    // Store IDs in cache
    categories.forEach(({ id, custom_url: { url } }) => {
        idCache.set(`${id}`, url);
    });

    return categories;
};

/**
 * This method recursively creates a nested tree structure for the given categories.
 *
 * @param {any[]} categories The arrays of categories to work with.
 * @param {number} [parentId=0] ID of the parent category.
 */
const buildCategoryTree = (categories, parentId = 0) => {
    return categories
        .filter((category) => category.parent_id === parentId)
        .sort(({ sort_order: a }, { sort_order: b }) => a - b)
        .map(({ id, name: label }) => {
            const children = buildCategoryTree(categories, id);
            return { id, label, ...(children?.length && { children }) };
        });
};

/**
 * This method filters categories by their label based on the given keyword.
 * @param {string} keyword Keyword to filter the categories by.
 * @param {any[]} categories Categories to filter.
 * @return {any[]} Filtered categories.
 */
const filterCategories = (keyword, categories) => {
    const query = keyword.toLowerCase();
    return categories.filter(category => category.label?.toLowerCase().includes(query));
}

/**
 * This method fetches all categories and returns them as a flat list structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {number | string} [parentId] ID of the parent category to filter categories by.
 * @param {string} [keyword] Keyword to filter the categories by.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category tree.
 */
const categoriesGet = async (parentId, keyword, lang, page = 1) => {
    parentId = parentId && getNumber(parentId, 'parentId');

    const categories = await fetchCategories();

    const tree = buildCategoryTree(categories, parentId);

    let list = flattenCategories(tree);

    if (keyword) {
        list = filterCategories(keyword, list);
    }

    // Pagination
    const result = [];
    const total = list.length;
    for (let i = 0; i < LIMIT && i < total - LIMIT * (page - 1); i++) {
        result.push(list[LIMIT * (page - 1) + i]);
    }
    return { categories: result, total, hasNext: page && total > page * LIMIT };
};

/**
 * This method fetches all categories and returns them as a nested structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {number | string} [parentId] ID of the parent category to filter categories by.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category tree.
 */
const categoryTreeGet = async (parentId) => {
    parentId = parentId && getNumber(parentId, 'parentId');

    const categories = await fetchCategories();

    const tree = buildCategoryTree(categories, parentId);

    return { categorytree: tree, total: categories.length, hasNext: false };
};

/**
 * This method fetches the data for the categories with the given IDs.
 * @see SwaggerUI {@link http://localhost:3000/api/#/Categories/categoriesCategoryIdsGet}
 *
 * @param {string[]} [categoryIds] IDs of the categories to get.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category data.
 */
const categoriesCategoryIdsGet = async (categoryIds) => {
    categoryIds = categoryIds
        .map((id) => parseInt(id) || null) // Parse IDs to numbers
        .filter((id) => id !== null); // Ignore invalid numbers

    const result = await categoriesGet();

    const categories = result.categories.filter((category) => {
        return categoryIds.includes(category.id);
    });

    return { categories, total: categories.length, hasNext: false };
};

/**
 * Transforms the given nested category tree to a flat list.
 *
 * @param {any[]} categories Categories to transform to flat list.
 * @return {any[]} The categories as a flat list.
 */
const flattenCategories = (categories) => {
    return categories.reduce((result, { children, ...rest }) => {
        result.push(rest);
        if (children) {
            result.push(...flattenCategories(children));
        }
        return result;
    }, []);
};

/**
 * This method returns the URL for the category with the given ID.
 *
 * @param {number} categoryId ID of the category to get the URL for.
 * @return {{url: string}} The URL of the category, null if given ID is invalid.
 */
const getCategoryUrl = async (categoryId) => {
    categoryId = getNumber(categoryId, 'categoryId');
    idCache.size || (await fetchCategories());
    if (idCache.has(categoryId.toString())) {
        return { url: idCache.get(categoryId.toString()) };
    } else {
        logger.logError(LOGGING_NAME, 'Invalid categoryId passed: ' + categoryId);
        return null;
    }
};

module.exports = {
    categoriesGet,
    categoriesCategoryIdsGet,
    categoryTreeGet,
    getCategoryUrl
};
