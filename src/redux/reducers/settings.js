import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialSettingsState from '../initial-state/settings';
import { getWebsiteFromUrl } from '../../utils/url';

// TYPE

export const SET_SETTINGS_ACTION = 'auth/SET_SETTINGS';

// ACTION-CREATOR

export const setSettingsAction = ({ webServerAddress, apiServerAddress, server }) => ({
    type: SET_SETTINGS_ACTION,
    webServerAddress,
    apiServerAddress,
    server,
});

// REDUCER

const setSettings = (state, action) => {
    const {
        server,
        webServerAddress,
        apiServerAddress,
    } = action;

    const settings = {
        server: { $set: server },
        webServerAddress: { $set: getWebsiteFromUrl(webServerAddress) },
        apiServerAddress: { $set: getWebsiteFromUrl(apiServerAddress) },
    };

    const newState = update(state, settings);
    return newState;
};

export const settingsReducers = {
    [SET_SETTINGS_ACTION]: setSettings,
};

const settingsReducer = createReducerWithMap(settingsReducers, initialSettingsState);
export default settingsReducer;
