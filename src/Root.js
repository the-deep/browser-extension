import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { initializeStyles } from '#rsu/styles';
import { styleProperties } from '#constants';

import App from './App';
import store from './store';

console.warn('Environment:', process.env);

export default class Root extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;
        initializeStyles(styleProperties);

        console.info('React version:', React.version);
    }

    UNSAFE_componentWillMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        persistStore(this.store, undefined, afterRehydrateCallback);
    }

    render() {
        const { rehydrated } = this.state;
        if (!rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return (<div />);
        }

        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}
