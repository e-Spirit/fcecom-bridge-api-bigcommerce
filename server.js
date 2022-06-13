require('dotenv').config();

const { BridgeCore } = require('fcecom-bridge-commons');
const logger = require('./src/utils/logger')
const path = require('path');
// Validate configuration
const propertiesToCheck = ['GRAPHQL_URL', 'API_BASE_URL', 'ACCESS_TOKEN'];
for (const propertyName of propertiesToCheck) {
  if (typeof process.env[propertyName] === 'undefined') {
    logger.logError(`Configuration for '${propertyName}' is missing`);
    process.exit(1);
  }
}

const { BRIDGE_AUTH_USERNAME, BRIDGE_AUTH_PASSWORD, CONN_MODE, SSL_KEY, SSL_CERT, LOG_LEVEL } = process.env;

const port = process.env.NODE_PORT || process.env.PORT || 3000;

BridgeCore({
  username: BRIDGE_AUTH_USERNAME,
  password: BRIDGE_AUTH_PASSWORD,
  servicesDir: path.join(process.cwd(), './src/service'),
  port: port,
  logLevel: LOG_LEVEL,
  features: {
    contentPages: true,
    categoryTree: true
  },
  useSsl: CONN_MODE === 'HTTPS',
  sslCert: SSL_CERT,
  sslKey: SSL_KEY
});