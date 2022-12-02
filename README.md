# FirstSpirit Connect for Commerce - BigCommerce Bridge

## Overview

### Connect for Commerce Bridge API

The bridge API serves as a REST interface which is able to fetch content, product and category information from any shop backend and to display them in reports in the FirstSpirit ContentCreator.

In order to connect the bridge API with a given shop backend a bridge is needed. It acts as a microservice between the shop backend and FirstSpirit. Further information about how to implement and use a bridge can be found in the official [documentation](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Documentation_EN.html).

For more information about FirstSpirit or Connect for Commerce please use [this contact form](https://www.crownpeak.com/contact-us) to get in touch.

### BigCommerce

This project implements the bridge API to connect FirstSpirit and the BigCommerce e-commerce platform.

For more information about BigCommerce visit [the BigCommerce website](https://www.bigcommerce.com/).
Lean more about their API [here](https://developer.bigcommerce.com/docs/ZG9jOjIyMDYwNQ-about-our-ap-is).

## Prerequisites
- Server running node 14 or later
- BigCommerce shop instance
- Access token for the BigCommerce API (REST and GraphQL)

## Getting Started

### Configuration
The configuration is done by copying the `.env.template` file in the root directory to a `.env` file and editing it.

| Param                | Description                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                 | The port on which the bridge is started.                                                                                                                    |
| BRIDGE_AUTH_USERNAME | The username to access the bridge's API.                                                                                                                    |
| BRIDGE_AUTH_PASSWORD | The password to access the bridge's API.                                                                                                                    |
| CONN_MODE            | Whether to use HTTP or HTTPS for the bridge's API.                                                                                                          |
| SSL_CERT             | Path to the certificate file to use when using HTTPS.                                                                                                       |
| SSL_KEY              | Path to the private key file to use when using HTTPS.                                                                                                       |
| GRAPHQL_URL          | URL of the BigCommerce GraphQL. Learn how to obtain the URL [here](https://developer.bigcommerce.com/docs/ZG9jOjIyMDczOQ-graph-ql-storefront-api-overview). |
| API_BASE_URL         | URL of the BigCommerce REST API.                                                                                                                            |
| ACCESS_TOKEN         | Client secret for the BigCommerce API. Learn how to obtain it [here](https://support.bigcommerce.com/s/article/Store-API-Accounts?language=en_US).          |

### Run bridge
Before starting the bridge for the first time, you have to install its dependencies:
```
npm install
```

To start the bridge run:

```
npm start
```

### Run bridge in development mode
To start the bridge and re-start it whenever a file changed:
```
npm run start:watch
```

### View the Swagger UI interface

Open http://localhost:3000/docs in your browser to display the bridge's interactive API documentation.

### Configure FirstSpirit Module
In order to enable the Connect for Commerce FirstSpirit Module to communicate with the bridge, you have to configure it. Please refer to [the documentation](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Documentation_EN.html#install_pcomp) to learn how to achive this. 

## Legal Notices
The FirstSpirit Connect for Commerce BigCommerce bridge is a product of [Crownpeak Technology GmbH](https://www.crownpeak.com), Dortmund, Germany. The FirstSpirit Connect for Commerce BigCommerce bridge is subject to the Apache-2.0 license.

## Disclaimer
This document is provided for information purposes only. Crownpeak may change the contents hereof without notice. This document is not warranted to be error-free, nor subject to any other warranties or conditions, whether expressed orally or implied in law, including implied warranties and conditions of merchantability or fitness for a particular purpose. Crownpeak specifically disclaims any liability with respect to this document and no contractual obligations are formed either directly or indirectly by this document. The technologies, functionality, services, and processes described herein are subject to change without notice.