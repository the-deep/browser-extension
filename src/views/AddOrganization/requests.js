import { methods } from '#request';

const requests = {
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
            const newOrganization = {
                key: response.id,
                label: response.title,
                shortName: response.shortName,
                logo: response.logoUrl,
            };

            handleOrganizationCreateSuccess(newOrganization);
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
