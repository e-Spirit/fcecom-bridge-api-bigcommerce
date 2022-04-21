const axios = require('axios');

const { API_BASE_URL, ACCESS_TOKEN, CLIENT_ID } = process.env;
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Auth-Client': CLIENT_ID, 'X-Auth-Token': ACCESS_TOKEN },
});

let lastError;

client.interceptors.response.use(
  (response) => {
    console.log(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    const { message, response } = (lastError = error);
    const details = response?.data?.detail || message;
    if (response) {
      console.error(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}\n\t${details}`);
    } else {
      console.error(` ↳ ${message}`);
    }
    return Promise.reject({ error: true, message: details });
  }
);

module.exports = client;
module.exports.getLastError = () => lastError;

let gqlToken;
const gqlClient = axios.create();

gqlClient.interceptors.request.use(async (config) => {
  if (!gqlToken) {
    const { data: { data = {} } = {} } = await client.post('/v3/storefront/api-token', { channel_id: 1, expires_at: ~~(Date.now() / 1000) + 60 * 60 * 24 });
    gqlToken = data.token;
  }
  config.headers = { ...config.headers, Authorization: `Bearer ${gqlToken}` };
  return config;
});

gqlClient.interceptors.response.use(
  (response) => (console.log(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`), response),
  (error) => {
    const { message, response } = (lastError = error);
    if (error && error.config && !error.config.isRetry && error.response.status == 401) {
      gqlToken = null;
      return gqlClient({ isRetry: true, ...error.config });
    } else if (response && response.config) {
      console.error(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}\n   ${message}`);
    }
    return Promise.reject({error: true, message });
  }
);

module.exports.gql = (query) =>
  gqlClient({
    url: process.env.GRAPHQL_URL,
    method: 'POST',
    data: { query },
  });
