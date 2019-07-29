module.exports = (env) => {
    const NODE_ENV = env.NODE_ENV || 'development';

    const reduceFn = (acc, key) => {
        acc[key] = JSON.stringify(env[key]);
        return acc;
    };
    const initialState = { NODE_ENV: JSON.stringify(NODE_ENV) };

    const ENV_VARS = Object.keys(env)
        .filter(v => v.startsWith('REACT_APP_'))
        .reduce(reduceFn, initialState);

    console.warn('Environment variables to be passed to react app: ', ENV_VARS);

    return ENV_VARS;
};
