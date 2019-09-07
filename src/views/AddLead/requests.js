import { methods } from '#request';

const requests = {
    projectsListRequest: {
        url: '/projects/member-of/',
        schemaName: 'projectsList',
        query: {
            fields: [
                'id',
                'title',
            ],
        },
        method: methods.GET,
        onMount: true,
        onSuccess: ({ props, response }) => {
            props.setProjectList({ projects: response.results });
        },
    },
    webInfoRequest: {
        url: '/web-info-extract/',
        body: ({ props: { currentTabId } }) => ({ url: currentTabId }),
        method: methods.POST,
        onPropsChanged: ['currentTabId'],
        onMount: ({ props: { currentTabId } }) => currentTabId && currentTabId.length > 0,
        schemaName: 'webInfo',
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill(response);
        },
    },
    organizationsRequest: {
        url: '/organizations/',
        query: ({ params }) => ({
            search: params.searchText,
            limit: 30,
        }),
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            params.setSearchedOrganizations(response.results);
        },
        options: {
            delay: 1000,
        },
    },
    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.GET,
        schemaName: 'leadOptions',
        query: ({ props: { inputValues } }) => ({
            project: inputValues.project,
            fields: [
                'assignee',
                'confidentiality',
            ],
        }),
        onPropsChanged: {
            inputValues: ({
                props: { inputValues = {} },
                prevProps: { inputValues: prevInputValues = {} },
            }) => (
                inputValues.project !== prevInputValues.project
                && inputValues.project
                && inputValues.project.length > 0
            ),
        },
        onMount: ({
            props: {
                inputValues: { project } = {},
            },
        }) => project && project.length > 0,
        onSuccess: ({ props, params, response }) => {
            props.setLeadOptions({ leadOptions: response });
            params.handleExtraInfoFill();
        },
    },
    leadCreateRequest: {
        url: '/leads/',
        method: methods.POST,
        body: ({ params }) => ({
            ...params.values,
            sourceType: 'website',
        }),
        schemaName: 'array.lead',
        onSuccess: ({
            props: { currentTabId, webServerAddress },
            params,
            response,
        }) => {
            let targetUrl;
            if (response.length === 1) {
                const [firstResponse] = response;
                const submittedLeadId = firstResponse.id;
                const submittedProjectId = firstResponse.project;
                targetUrl = `${webServerAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/edit-entries/`;
            }

            params.handleLeadCreationSuccess({
                targetUrl,

                tabId: currentTabId,
            });
        },
        onFailure: ({ params, error }) => {
            params.handleLeadCreationFailure(error.faramErrors);
        },
        onFatal: ({ params }) => {
            params.handleLeadCreationFatal();
        },
    },
};

export default requests;
