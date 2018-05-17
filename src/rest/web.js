import {
    getApiEndpoint,
    getWebEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';

export const createUrlForWebInfo = () => (`
    ${getApiEndpoint()}/web-info-extract/
`);

export const createParamsForWebInfo = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createUrlForBrowserExtensionPage = () => (`
    ${getWebEndpoint()}/browser-extension/
`);
