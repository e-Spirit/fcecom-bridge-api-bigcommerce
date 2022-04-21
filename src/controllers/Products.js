'use strict';

const utils = require('../../src/utils/writer.js');
const Products = require('../../src/service/ProductsService');

module.exports.productsGet = async function productsGet(req, res, next, categoryId, q, lang, page) {
  await Products.productsGet(categoryId, q, lang, page)
    .then(function (response) {
      res.set({ 'X-Total': response.total, 'X-HasNext': response.hasNext });
      utils.writeJson(res, response.products);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.productsProductIdsGet = async function productsProductIdsGet(req, res, next, lang, productIds) {
  await Products.productsProductIdsGet(productIds, lang)
    .then(function (response) {
      utils.writeJson(res, response.products);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.productsProductIdsHead = async function productsProductIdsHead(req, res, next) {
  res.send(200);
};

/* method to support deprecated route */
module.exports.productsProductIdsGetOld = async function productsProductIdsGetOld(req, res, next, lang, productIds) {
  await module.exports.productsProductIdsGet(req, res, next, lang, productIds);
};
