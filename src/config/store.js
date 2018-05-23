import localforage from 'localforage';

const storeConfig = {
    blacklist: ['mem'],
    key: 'deeper-extension',
    storage: localforage,
    version: 1,
};

export default storeConfig;
