export const webServerAddressSelector = ({ settings }) => (
    settings.serverAddress || ''
);

export const apiServerAddressSelector = ({ settings }) => (
    settings.apiAddress || ''
);

export const serverSelector = ({ settings }) => (
    settings.server || ''
);


export const serverAddressSelector = ({ settings }) => ({
    web: settings.webServerAddress || '',
    api: settings.apiServerAddress || '',
    server: settings.server || '',
});
