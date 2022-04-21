require('dotenv').config();

const oas3Tools = require('oas3-tools');
const https = require('https');
const fs = require('fs');
const path = require('path');
// Validate configuration
const propertiesToCheck = ['GRAPHQL_URL', 'API_BASE_URL', 'ACCESS_TOKEN', 'CLIENT_ID'];
for (const propertyName of propertiesToCheck) {
  if (typeof process.env[propertyName] === 'undefined') {
    console.error(`Configuration for '${propertyName}' is missing`);
    process.exit(1);
  }
}

// Setup basic auth
const { BRIDGE_AUTH_USERNAME, BRIDGE_AUTH_PASSWORD, auth = BRIDGE_AUTH_PASSWORD && `${BRIDGE_AUTH_USERNAME}:${BRIDGE_AUTH_PASSWORD}` } = process.env;
function validate(request) {
  if (!auth) {
    return true;
  }
  return request.headers.authorization === `Basic ${Buffer.from(auth).toString('base64')}`;
}

// swaggerRouter configuration
const options = {
  routing: {
    controllers: path.join(__dirname, './src/controllers'),
  },
  openApiValidator: {
    validateSecurity: {
      handlers: {
        basicAuth: validate,
      },
    },
  },
};

const expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'src/api/openapi.yaml'), options);
const app = expressAppConfig.getApp();

// Setup basic logging
app.use(({ method, url }, res, next) => (console.log(`${method} ${url}`), next()));

// Start listening
const PORT = process.env.NODE_PORT || process.env.PORT || 3000;

if (process.env.CONN_MODE == 'HTTPS') {
  https
    .createServer(
      {
        key: fs.readFileSync(path.resolve('./ssl/ssl.key')),
        cert: fs.readFileSync(path.resolve('./ssl/ssl.pem')),
      },
      app
    )
    .listen(PORT, () => console.log(`listening at https://localhost.e-spirit.live:${PORT}`));
} else {
  app.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));
}
