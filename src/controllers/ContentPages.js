'use strict';

const utils = require('../../src/utils/writer.js');
const ContentPages = require('../../src/service/ContentPagesService');

module.exports.contentPagesContentIdDelete = async function contentPagesContentIdDelete(req, res, next, contentId, lang) {
  await ContentPages.contentPagesContentIdDelete(contentId, lang)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.contentPagesContentIdPut = async function contentPagesContentIdPut(req, res, next, body, lang, contentId) {
  await ContentPages.contentPagesContentIdPut(body, lang, contentId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.contentPagesContentIdsGet = async function contentPagesContentIdsGet(req, res, next, lang, contentIds) {
  await ContentPages.contentPagesContentIdsGet(contentIds, lang)
    .then(function (response) {
      utils.writeJson(res, response.contentPages);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.contentPagesGet = async function contentPagesGet(req, res, next, q, lang, page) {
  await ContentPages.contentPagesGet(q, lang, page)
    .then(function (response) {
      res.set({ 'X-Total': response.total, 'X-HasNext': response.hasNext });
      utils.writeJson(res, response.contentPages);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.contentPagesHead = function contentPagesHead(req, res, next) {
  res.send(200);
};

module.exports.contentPagesPost = function contentPagesPost(req, res, next, body, lang) {
  ContentPages.contentPagesPost(body, lang)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
