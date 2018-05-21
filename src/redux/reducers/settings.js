import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialSettingsState from '../initial-state/settings';
import { getWebsiteFromUrl } from '../../utils/url';

// TYPE

export const SET_SETTINGS_ACTION = 'auth/SET_SETTINGS';

// ACTION-CREATOR

export const setSettingsAction = ({ serverAddress, apiAddress }) => ({
    type: SET_SETTINGS_ACTION,
    serverAddress,
    apiAddress,
});

// REDUCER

const setSettings = (state, action) => {
    const {
        webServerAddress,
        apiServerAddress,
        server,
    } = action;

    const settings = {
        webServerAddress: { $set: getWebsiteFromUrl(apiServerAddress) },
        apiServerAddress: { $set: getWebsiteFromUrl(webServerAddress) },
        server: { $set: server },
    };

    const newState = update(state, settings);
    return newState;
};

export const settingsReducers = {
    [SET_SETTINGS_ACTION]: setSettings,
};

const settingsReducer = createReducerWithMap(settingsReducers, initialSettingsState);
export default settingsReducer;

