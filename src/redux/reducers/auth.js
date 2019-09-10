import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialAuthState from '../initial-state/auth';

// TYPE

export const SET_TOKEN_ACTION = 'auth/SET_TOKEN';

// ACTION-CREATOR

export const setTokenAction = token => ({
    type: SET_TOKEN_ACTION,
    token,
});


// REDUCER

const setToken = (state, action) => {
    const {
        token,
    } = action;

    const settings = {
        token: {
            $set: token,
        },
    };

    const newState = update(state, settings);
    return newState;
};

export const authReducers = {
    [SET_TOKEN_ACTION]: setToken,
};

const authReducer = createReducerWithMap(authReducers, initialAuthState);
export default authReducer;
