import {
    compose,
    createStore,
    applyMiddleware,
} from 'redux';
import logger from './redux/middlewares/logger';
import reducer from './redux/reducers';
import { tokenSelector } from './redux/selectors/auth';
import {
    commonHeaderForPost,
    commonHeaderForGet,
} from './config//rest';

import store from './store';

const middleware = [
    logger,
];

// Get compose from Redux Devtools Extension
// eslint-disable-next-line no-underscore-dangle
const reduxExtensionCompose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

// Override compose if development mode and redux extension is installed
const overrideCompose = process.env.NODE_ENV === 'development' && reduxExtensionCompose;
const applicableComposer = !overrideCompose
    ? compose
    : reduxExtensionCompose({ /* specify extention's options here */ });

const enhancer = applicableComposer(applyMiddleware(...middleware));

// NOTE: replace undefined with an initialState if required
export default createStore(reducer, undefined, enhancer);

// Inject authorization in headers
let currentAccessToken;
store.subscribe(() => {
    const prevAccessToken = currentAccessToken;
    const token = tokenSelector(store.getState());

    currentAccessToken = token.access;

    if (prevAccessToken !== currentAccessToken) {
        if (currentAccessToken) {
            const auth = `Bearer ${currentAccessToken}`;
            commonHeaderForGet.Authorization = auth;
            commonHeaderForPost.Authorization = auth;
        } else {
            commonHeaderForGet.Authorization = undefined;
            commonHeaderForPost.Authorization = undefined;
        }
    }
});
