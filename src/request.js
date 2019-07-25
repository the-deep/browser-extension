import { compose } from 'redux';
import { connect } from 'react-redux';

import {
    createRequestCoordinator,
    methods,
} from '@togglecorp/react-rest-request';

import { getApiEndpoint } from '#config/rest';
import schema from '#schema';
import { tokenSelector } from '#redux';

const alterResponseErrorToFaramError = (errors) => {
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
    token: tokenSelector(state),
});

const CustomRequestCoordinator = createRequestCoordinator({
    transformParams: (data, props) => {
        const { access } = props.token;
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
            token, // eslint-disable-line no-unused-vars
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

export * from '@togglecorp/react-rest-request';
