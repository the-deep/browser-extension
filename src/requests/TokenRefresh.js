import Request from '../utils/Request';
import {
    createParamsForTokenRefresh,
    createUrlForTokenRefresh,
} from '../rest/token.js';

import { alterResponseErrorToFaramError } from '../utils/faram.js';

const fatalErrorMessage = 'Failed to communicate with the server';

export default class TokenRefresh extends Request {
    handlePreLoad = () => {
        this.parent.setState({
            pendingTokenRefresh: true,
        });
    }

    handleSuccess = (response) => {
        const { setToken } = this.parent;

        const params = {
            token: {
                ...this.createOptions.params,
                access: response.access,
            },
        };

        setToken(params);

        this.parent.setState({
            error: undefined,
            pendingTokenRefresh: false,
            authenticated: true,
        });
    }

    handleFailure = (response = {}) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);

        this.parent.setState({
            pendingTokenRefresh: false,
            authenticated: false,
            error: faramErrors.$internal.join(', '),
        });
    }

    handleFatal = () => {
        console.warn('token refresh fatal error');

        this.parent.setState({
            pendingTokenRefresh: false,
            authenticated: false,
            error: fatalErrorMessage,
        });
    }

    create = (token = {}) => {
        this.createDefault({
            url: createUrlForTokenRefresh(),
            createParams: createParamsForTokenRefresh,
            params: token,
        });
    }
}
