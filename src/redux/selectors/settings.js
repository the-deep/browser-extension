import { createSelector } from 'reselect';

export const webServerAddressSelector = ({ settings }) => (
    settings.webServerAddress || ''
);

export const apiServerAddressSelector = ({ settings }) => (
    settings.apiServerAddress || ''
);

export const serverSelector = ({ settings }) => (
    settings.server || ''
);

export const serverAddressSelector = createSelector(
    webServerAddressSelector,
    apiServerAddressSelector,
    serverSelector,
    (web, api, server) => ({
        web,
        api,
        server,
    }),
);
