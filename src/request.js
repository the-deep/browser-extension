import { compose } from 'redux';
import { connect } from 'react-redux';

import {
    createRequestCoordinator,
    methods,
} from '@togglecorp/react-rest-request';

import {
    getApiEndpoint,
    getWebEndpoint,
} from '#config/rest';

import schema from '#schema';
import { tokenSelector } from '#redux';

const alterResponseErrorToFaramError = (e) => {
    let errors = e;

    if (Array.isArray(e)) {
        errors = e.reduce(
            (acc, error) => {
                const {
                    nonFieldErrors = [],
                    ...formFieldErrors
                } = error;

                acc.nonFieldErrors = acc.nonFieldErrors.concat(nonFieldErrors);

                Object.keys(formFieldErrors || {}).forEach(
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
            method: method || methods.GET,
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
    transformUrl: (url) => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return `${getApiEndpoint()}${url}`;
    },
    transformResponse: (body, request) => {
        const {
            url,
            method,
            schemaName,
        } = request;
        if (schemaName === undefined) {
            // NOTE: usually there is no response body for DELETE
            if (method !== 'DELETE') {
                console.error(`Schema is not defined for ${url} ${method}`);
            }
        } else {
            try {
                schema.validate(body, schemaName);
            } catch (e) {
                console.error(url, method, body, e.message);
                throw (e);
            }
        }
        return body;
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

export * from '@togglecorp/react-rest-request';
