import { createSelector } from 'reselect';

export const webServerAddressSelector = ({ settings }) => (
    settings.webServerAddress || ''
);

export const apiServerAddressSelector = ({ settings }) => (
    settings.apiServerAddress || ''
);

export const serverlessAddressSelector = ({ settings }) => (
    settings.serverlessAddress || ''
);

export const serverSelector = ({ settings }) => (
    settings.server || ''
);

export const serverAddressSelector = createSelector(
    webServerAddressSelector,
    apiServerAddressSelector,
    serverlessAddressSelector,
    serverSelector,
    (web, api, serverless, server) => ({
        web,
        api,
        serverless,
        server,
    }),
);
