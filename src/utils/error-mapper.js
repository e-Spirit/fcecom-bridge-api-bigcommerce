const logger = require('./logger');
const { BodyValidationError, ErrorCode } = require('fcecom-bridge-commons');

const COULD_NOT_MAP_ERROR = 'Could not map error, please check the shop system logs.';

const mapError = (response) => {
    const method = response?.config?.method;
    const error = response?.data;

    if (method === 'post' || method === 'put') {
        mapCreationError(error);
    } else {
        logger.logDebug(COULD_NOT_MAP_ERROR);
    }
};

const mapCreationError = (error) => {
    if (error && typeof error === 'object') {
        const mappedError = {
            field: extractField(error.detail) || 'unknown',
            cause: extractErrorCause(error.detail) || 'unknown',
            code: getErrorCode(error.detail)
        };
        throw new BodyValidationError('Invalid field in body', { cause: [mappedError] });
    } else {
        logger.logDebug(COULD_NOT_MAP_ERROR);
    }
};

const extractErrorCause = (input) => {
    if (input != null) {
        if (input.includes('must be unique')) {
            return 'mustBeUnique';
        }
    }
};

const extractField = (input) => {
    if (input != null) {
        if (input?.includes('Name')) {
            return 'label';
        }
        if (input.includes('Url')) {
            return 'path';
        }
    }
};

const getErrorCode = (bigCommerceError) => {
    switch (extractField(bigCommerceError)) {
        case 'path':
        case 'label':
            switch (extractErrorCause(bigCommerceError)) {
                case 'mustBeUnique':
                    return ErrorCode.FIELD_MUST_BE_UNIQUE;
                default:
                    return ErrorCode.UNKNOWN;
            }
        default:
            return ErrorCode.UNKNOWN;
    }
};

module.exports = {
    mapErrors: mapError
};
