import produce from 'immer';
import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialDomainDataState from '../initial-state/domainData';

// TYPE

export const UPDATE_INPUT_VALUES_ACTION = 'extension/UPDATE_INPUT_VALUES';
export const CLEAR_TABID_DATA_ACTION = 'extension/CLEAR_TABID_DATA';
export const SET_ORGANIZATIONS_ACTION = 'extension/SET_ORGANIZATIONS';
export const CLEAR_DOMAIN_DATA_ACTION = 'extension/CLEAR_DOMAIN_DATA';

// ACTION-CREATOR

export const updateInputValuesAction = ({ tabId, values }) => ({
    type: UPDATE_INPUT_VALUES_ACTION,
    tabId,
    values,
});

export const clearTabIdDataAction = ({ tabId }) => ({
    type: CLEAR_TABID_DATA_ACTION,
    tabId,
});

export const setOrganizationsAction = ({ tabId, organizations }) => ({
    type: SET_ORGANIZATIONS_ACTION,
    tabId,
    organizations,
});

export const clearDomainDataAction = () => ({
    type: CLEAR_DOMAIN_DATA_ACTION,
});

// REDUCER

const clearDomainData = () => {
    console.warn('Clearing domain data');
    return initialDomainDataState;
};

const clearTabIdData = (state, action) => {
    const { tabId } = action;

    const newState = produce(state, (safeState) => {
        if (safeState[tabId]) {
            // eslint-disable-next-line no-param-reassign
            delete safeState[tabId];
        }
    });

    return newState;
};

const updateInputValues = (state, action) => {
    const {
        tabId,
        values,
    } = action;

    const settings = {
        [tabId]: { $auto: {
            inputValues: { $auto: {
                $set: values,
            } },
        } },
    };

    const newState = update(state, settings);
    return newState;
};

const setOrganizations = (state, action) => {
    const {
        tabId,
        organizations,
    } = action;

    const newState = produce(state, (safeState) => {
        if (!safeState[tabId]) {
            // eslint-disable-next-line no-param-reassign
            safeState[tabId] = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState[tabId].organizations = organizations;
    });

    return newState;
};

export const domainDataReducers = {
    [UPDATE_INPUT_VALUES_ACTION]: updateInputValues,
    [CLEAR_TABID_DATA_ACTION]: clearTabIdData,
    [SET_ORGANIZATIONS_ACTION]: setOrganizations,
    [CLEAR_DOMAIN_DATA_ACTION]: clearDomainData,
};

const domainDataReducer = createReducerWithMap(domainDataReducers, initialDomainDataState);
export default domainDataReducer;
