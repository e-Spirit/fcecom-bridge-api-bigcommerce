const axios = require('axios');
const logger = require('./logger');
const errorMapper = require('./error-mapper');

const { API_BASE_URL, ACCESS_TOKEN } = process.env;
const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'X-Auth-Token': ACCESS_TOKEN }
});

const LOGGING_NAME = 'http-client';

let lastError;

client.interceptors.response.use(
    (response) => {
        logger.logInfo(
            LOGGING_NAME,
            `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`
        );
        return response;
    },
    (error) => {
        const { message, response } = (lastError = error);
        const details = response?.data?.detail || message;
        const data = response?.data || message;
        const status = response?.status || 500;
        if (response) {
            logger.logError(
                LOGGING_NAME,
                `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${
                    response.statusText
                } ${details}`
            );
            errorMapper.mapErrors(response);
        } else {
            logger.logError(LOGGING_NAME, `↳ ${message}`);
        }
        return Promise.reject({ error: true, data: data?.title ?? data, status });
    }
);

module.exports = client;
module.exports.getLastError = () => lastError;

let gqlToken;
const gqlClient = axios.create();

gqlClient.interceptors.request.use(async (config) => {
    if (!gqlToken) {
        const { data: { data = {} } = {} } = await client.post('/v3/storefront/api-token', {
            channel_id: 1,
            expires_at: ~~(Date.now() / 1000) + 60 * 60 * 24
        });
        gqlToken = data.token;
    }
    config.headers = { ...config.headers, Authorization: `Bearer ${gqlToken}` };
    return config;
});

gqlClient.interceptors.response.use(
    (response) => (
        logger.logInfo(
            LOGGING_NAME,
            `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`
        ),
        response
    ),
    (error) => {
        const { message, response } = (lastError = error);
        const data = response?.data || message;
        const status = response?.status || 500;
        if (error && error.config && !error.config.isRetry && error.response.status == 401) {
            gqlToken = null;
            return gqlClient({ isRetry: true, ...error.config });
        } else if (response && response.config) {
            logger.logError(
                LOGGING_NAME,
                `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${
                    response.statusText
                } ${message}`
            );
        }
        return Promise.reject({ error: true, data, status });
    }
);

module.exports.gql = (query) =>
    gqlClient({
        url: process.env.GRAPHQL_URL,
        method: 'POST',
        data: { query }
    });
