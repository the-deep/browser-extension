import localforage from 'localforage';

const storeConfig = {
    blacklist: ['mem'],
    key: 'deeper-browser-extension',
    storage: localforage,
    version: 1,
};

export default storeConfig;
