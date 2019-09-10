import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialDomainDataState from '../initial-state/domainData';

// TYPE

export const UPDATE_INPUT_VALUES_ACTION = 'extension/UPDATE_INPUT_VALUES';
export const CLEAR_INPUT_VALUE_ACTION = 'extension/CLEAR_INPUT_VALUES';
export const CLEAR_DOMAIN_DATA_ACTION = 'extension/CLEAR_DOMAIN_DATA';

// ACTION-CREATOR

export const updateInputValuesAction = ({ tabId, values }) => ({
    type: UPDATE_INPUT_VALUES_ACTION,
    tabId,
    values,
});

export const clearInputValueAction = ({ tabId }) => ({
    type: CLEAR_INPUT_VALUE_ACTION,
    tabId,
});

export const clearDomainDataAction = () => ({
    type: CLEAR_DOMAIN_DATA_ACTION,
});

// REDUCER

const clearDomainData = () => {
    console.warn('Clearing domain data');
    return initialDomainDataState;
};

const clearInputValue = (state, action) => {
    const { tabId } = action;

    const settings = {
        [tabId]: { $set: undefined },
    };

    const newState = update(state, settings);
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

export const domainDataReducers = {
    [UPDATE_INPUT_VALUES_ACTION]: updateInputValues,
    [CLEAR_INPUT_VALUE_ACTION]: clearInputValue,
    [CLEAR_DOMAIN_DATA_ACTION]: clearDomainData,
};

const domainDataReducer = createReducerWithMap(domainDataReducers, initialDomainDataState);
export default domainDataReducer;
