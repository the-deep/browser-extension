import { methods } from '#request';

const requests = {
    organizationTypesRequest: {
        url: '/organization-types/',
        method: methods.GET,
        onMount: true,
    },
    addOrganizationRequest: {
        url: '/organizations/',
        method: methods.POST,
        onMount: false,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            params: {
                handleOrganizationCreateSuccess,
            },
            response,
        }) => {
            handleOrganizationCreateSuccess(response);
        },
        onFailure: ({
            params: {
                handleOrganizationCreateFailure,
            },
            error,
        }) => {
            handleOrganizationCreateFailure(error.faramErrors);
        },
        onFatal: ({
            params: {
                handleOrganizationCreateFatal,
            },
        }) => {
            handleOrganizationCreateFatal();
        },
    },
};

export default requests;
