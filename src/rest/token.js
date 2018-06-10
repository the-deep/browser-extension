import {
    getApiEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';

export const createUrlForTokenRefresh = () => (`
    ${getApiEndpoint()}/token/refresh/
`);

export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ refresh }),
});
