import { createStore, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';

import reducer from './redux/reducers';
import logger from './redux/middlewares/logger';

// Invoke refresh access token every 10m
const middleware = [
    logger,
];

// Override compose if development mode and redux extension is installed
const overrideCompose = process.env.NODE_ENV === 'development';
const applicableComposer = overrideCompose
    ? composeWithDevTools({ realtime: true })
    : compose;

const enhancer = applicableComposer(
    applyMiddleware(...middleware),
);

const store = createStore(reducer, undefined, enhancer);
export default store;
