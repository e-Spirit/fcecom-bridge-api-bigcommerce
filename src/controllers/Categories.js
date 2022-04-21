'use strict';

const utils = require('../../src/utils/writer.js');
const Categories = require('../../src/service/CategoriesService');

module.exports.categoriesGet = async function categoriesGet(req, res, next, parentId, lang, page) {
  await Categories.categoriesGet(parentId, lang, page)
    .then(function (response) {
      res.set({ 'X-Total': response.total, 'X-HasNext': response.hasNext });
      utils.writeJson(res, response.categories);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesCategoryIdsGet = async function categoriesCategoryIdsGet(req, res, next, lang, categoryIds) {
  await Categories.categoriesCategoryIdsGet(categoryIds, lang)
    .then(function (response) {
      utils.writeJson(res, response.categories);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesCategoryIdsHead = async function categoriesCategoryIdsHead(req, res, next) {
  res.send(200);
};

/* method to support deprecated route */
module.exports.categoriesCategoryIdsGetOld = async function categoriesCategoryIdsGetOld(req, res, next, lang, productIds) {
  await module.exports.categoriesCategoryIdsGet(req, res, next, lang, productIds);
};

module.exports.categoryTreeGet = async function categoryTreeGet(req, res, next, parentId, lang) {
  await Categories.categoryTreeGet(parentId, lang)
    .then(function (response) {
      utils.writeJson(res, response.categorytree);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoryTreeHead = function categoryTreeHead(req, res, next) {
  res.send(200);
};
