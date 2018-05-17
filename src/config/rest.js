import { RestRequest } from '../vendor/react-store/utils/rest';
import store from '../store';
import {
    webServerAddressSelector,
    apiServerAddressSelector,
} from '../redux';

export const prep = RestRequest.prepareUrlParams;

export const getWebServerAddress = () => webServerAddressSelector(store.getState());
export const getApiServerAddress = () => apiServerAddressSelector(store.getState());
export const getApiEndpoint = () => (`${getApiServerAddress()}/api/v1`);
export const getWebEndpoint = getWebServerAddress;

export const POST = 'POST';
export const GET = 'GET';

export const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const commonHeaderForGet = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
