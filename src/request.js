import { compose } from 'redux';
import { connect } from 'react-redux';

import { isNotDefined } from '@togglecorp/fujs';

import {
    createRequestCoordinator,
    createRequestClient as createRequestClientFromLib,
    methods as methodsFromLib,
} from '@togglecorp/react-rest-request';

import {
    webServerAddressSelector,
    apiServerAddressSelector,
    serverlessAddressSelector,
    tokenSelector,
} from '#redux';

import { sanitizeResponse } from '#utils/common';

import store from '#store';

import schema from '#schema';

export const getWebServerAddress = () => webServerAddressSelector(store.getState());
export const getApiServerAddress = () => apiServerAddressSelector(store.getState());
export const getServerlessServerAddress = () => {
    const endPoint = serverlessAddressSelector(store.getState());
    if (isNotDefined(endPoint)) {
        return 'https://services.thedeep.io';
    }
    return endPoint;
};

export const getApiEndpoint = () => (`${getApiServerAddress()}/api/v1`);
export const getWebEndpoint = getWebServerAddress;

function getVersionedUrl(endpoint, url) {
    const oldVersionString = '/v1';
    const versionString = '/v2';
    if (!url.startsWith(versionString)) {
        return `${endpoint}${url}`;
    }
    const startIndex = 0;
    const endIndex = endpoint.search(oldVersionString);
    const newEndpoint = endpoint.slice(startIndex, endIndex);
    return `${newEndpoint}${url}`;
}

const alterResponseErrorToFaramError = (e) => {
    let errors = e;

    if (Array.isArray(e)) {
        errors = e.reduce(
            (acc, error) => {
                const {
                    // eslint-disable-next-line no-unused-vars
                    internalNonFieldErrors = [],
                    nonFieldErrors = [],
                    ...formFieldErrors
                } = error;

                acc.nonFieldErrors = acc.nonFieldErrors.concat(nonFieldErrors);

                Object.keys(formFieldErrors).forEach(
                    (key) => {
                        if (acc[key]) {
                            // append only unique errors
                            const newErrors = error[key].filter(
                                d => acc[key].indexOf(d) === -1,
                            );
                            acc[key] = acc[key].concat(newErrors);
                        } else {
                            acc[key] = [...error[key]];
                        }
                    },
                );
                return acc;
            },
            {
                nonFieldErrors: [],
            },
        );
    }

    const {
        // eslint-disable-next-line no-unused-vars
        internalNonFieldErrors = [],
        nonFieldErrors = [],
        ...formFieldErrors
    } = errors;

    return Object.keys(formFieldErrors).reduce(
        (acc, key) => {
            const error = formFieldErrors[key];
            acc[key] = Array.isArray(error) ? error.join(' ') : error;
            return acc;
        },
        {
            $internal: nonFieldErrors,
        },
    );
};

const mapStateToProps = state => ({
    onlyMyToken: tokenSelector(state),
});

const CustomRequestCoordinator = createRequestCoordinator({
    transformParams: (data, props) => {
        const { access } = props.onlyMyToken;
        const {
            method,
            body,
        } = data;

        return {
            method: method || methodsFromLib.GET,
            body: JSON.stringify(body),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: access ? `Bearer ${access}` : undefined,
            },
        };
    },
    transformProps: (props) => {
        const {
            onlyMyToken, // eslint-disable-line no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url, request) => {
        const { extras = {} } = request;

        if (extras.type === 'serverless') {
            return `${getServerlessServerAddress()}${url}`;
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return getVersionedUrl(getApiEndpoint(), url);
    },
    transformResponse: (body, request) => {
        const {
            url,
            method,
            extras: {
                schemaName,
            } = {},
        } = request;

        const sanitizedBody = sanitizeResponse(body);

        if (schemaName === undefined) {
            // NOTE: usually there is no response body for DELETE
            if (method !== 'DELETE') {
                console.error(`Schema is not defined for ${url} ${method}`);
            }
        } else {
            try {
                schema.validate(sanitizedBody, schemaName);
            } catch (e) {
                console.error(url, method, sanitizedBody, e.message);
                throw (e);
            }
        }
        return sanitizedBody;
    },
    transformErrors: (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        return {
            response,
            faramErrors,
        };
    },
});

export const RequestCoordinator = compose(
    connect(mapStateToProps),
    CustomRequestCoordinator,
);


export const createUrlForBrowserExtensionPage = () => (`
    ${getWebEndpoint()}/browser-extension/
`);

export const methods = methodsFromLib;
export const createRequestClient = createRequestClientFromLib;
