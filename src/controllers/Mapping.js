'use strict';

const utils = require('../../src/utils/writer.js');
const Mapping = require('../../src/service/MappingService');

module.exports.lookupUrlGet = async function lookupUrlGet(req, res, next, url) {
  await Mapping.lookupUrlGet(url)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.storefrontUrlGet = async function storefrontUrlGet(req, res, next, type, id, lang) {
  await Mapping.storefrontUrlGet(type, id, lang)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
