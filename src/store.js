import { createStore } from 'redux';
import reducer from './redux/reducers';
import { tokenSelector } from './redux/selectors/auth';
import {
    commonHeaderForPost,
    commonHeaderForGet,
} from './config/rest';

const store = createStore(reducer);
export default store;

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
