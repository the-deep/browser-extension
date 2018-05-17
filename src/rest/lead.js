import {
    getApiEndpoint,
    GET,
    POST,
    commonHeaderForGet,
    commonHeaderForPost,
} from '../config/rest';

export const createUrlForLeadOptions = projectId => (`
    ${getApiEndpoint()}/lead-options/?project=${projectId}
`);

export const createParamsForLeadOptions = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const createUrlForLeadCreate = () => (`
    ${getApiEndpoint()}/leads/
`);

export const createParamsForLeadCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
