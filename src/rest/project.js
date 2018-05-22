import {
    getApiEndpoint,
    GET,
    commonHeaderForGet,
} from '../config/rest';

export const createUrlForProjectList = () => (`
    ${getApiEndpoint()}/projects/
`);

export const createParamsForProjectList = () => ({
    method: GET,
    headers: commonHeaderForGet,
});
