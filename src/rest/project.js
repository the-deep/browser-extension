import {
    getApiEndpoint,
    GET,
    commonHeaderForGet,
} from '../config/rest';

export const createUrlForProjects = () => (`
    ${getApiEndpoint()}/projects/
`);

export const createParamsForProjectList = () => ({
    method: GET,
    headers: commonHeaderForGet,
});
