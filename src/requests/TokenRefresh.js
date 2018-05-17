import Request from '../utils/Request';
import {
    createParamsForTokenRefresh,
    createUrlForTokenRefresh,
} from '../rest/token.js';
import {
    alterResponseErrorToFaramError,
} from '../utils/faram.js';

const errorMsg = 'Oops, something went wrong';

export default class TokenRefresh extends Request {
    handlePreLoad = () => {
        this.parent.setState({
            pendingTokenRefresh: true,
        });
    }

    handleSuccess = (response) => {
        const { setToken } = this.props;

        const params = {
            token: {
                ...this.createOptions.params,
                access: response.access,
            },
        };

        setToken(params);
        this.parent.setState({
            pendingTokenRefresh: false,
            errorMessage: undefined,
            authenticated: true,
        });
    }

    handleFailure = (response) => {
        console.error(response);
        const { formErrors } = alterResponseErrorToFaramError(response);
        this.parent.setState({
            pending: false,
            errorMessage: formErrors.join(', '),
            authenticated: false,
        });
    }

    handleFatal = (response) => {
        console.error(response);
        this.parent.setState({
            pending: false,
            error: errorMsg,
            authenticated: false,
        });
    }

    create = (token) => {
        super.create({
            url: createUrlForTokenRefresh(),
            createParams: createParamsForTokenRefresh,
            options: token,
        });
    }
}
