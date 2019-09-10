import jwtDecode from 'jwt-decode';

// NOTE: Use these to make sure reference don't change
const emptyObject = {};

export const tokenSelector = ({ auth }) => (
    auth.token || emptyObject
);

export const currentUserIdSelector = ({ auth }) => {
    const token = auth.token || {};
    const decodedToken = jwtDecode(token.access);

    return decodedToken.userId;
};
