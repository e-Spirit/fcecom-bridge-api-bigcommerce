require('dotenv').config();

const BridgeCommons = require('fcecom-bridge-commons');
const path = require('path');
// Validate configuration
const propertiesToCheck = ['GRAPHQL_URL', 'API_BASE_URL', 'ACCESS_TOKEN', 'CLIENT_ID'];
for (const propertyName of propertiesToCheck) {
  if (typeof process.env[propertyName] === 'undefined') {
    console.error(`Configuration for '${propertyName}' is missing`);
    process.exit(1);
  }
}

const { BRIDGE_AUTH_USERNAME, BRIDGE_AUTH_PASSWORD, CONN_MODE, SSL_KEY, SSL_CERT } = process.env;

const port = process.env.NODE_PORT || process.env.PORT || 3000;

BridgeCommons({
  username: BRIDGE_AUTH_USERNAME,
  password: BRIDGE_AUTH_PASSWORD,
  servicesDir: path.join(process.cwd(), './src/service'),
  port: port,
  features: {
    contentPages: true,
    categoryTree: true
  },
  useSsl: CONN_MODE === 'HTTPS',
  sslCert: SSL_CERT,
  sslKey: SSL_KEY
});