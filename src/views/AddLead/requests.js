import { unique, isDefined } from '@togglecorp/fujs';

import { methods } from '#request';

// TODO: block if failure for projectsListRequest and leadOptionsRequest

const requests = {
    projectsListRequest: {
        url: '/projects/member-of/',
        query: {
            fields: [
                'id',
                'title',
            ],
        },
        method: methods.GET,
        onMount: true,
        extras: {
            schemaName: 'projectsList',
        },
        options: {
            delay: 300,
        },
    },
    webInfoRequest: {
        url: '/web-info-extract/',
        body: ({ props: { currentTabId } }) => ({ url: currentTabId }),
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill(response);
        },
        extras: {
            schemaName: 'webInfo',
        },

        onMount: ({ props: { currentTabId } }) => currentTabId && currentTabId.length > 0,
        onPropsChanged: ['currentTabId'],
    },

    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.POST,
        body: ({ props: { inputValues } }) => ({
            projects: inputValues.project,
            leadGroups: [], // this will not fetch any leadGroups
            organizations: unique(
                [
                    inputValues.source,
                    inputValues.author,
                ].filter(isDefined),
                id => id,
            ),
        }),
        onSuccess: ({ params, response }) => {
            params.handleExtraInfoFill(response);
        },
        extras: {
            schemaName: 'leadOptions',
        },

        onMount: ({ props: { inputValues: { project } } }) => project && project.length > 0,
        onPropsChanged: {
            inputValues: ({
                prevProps: { inputValues: { project: oldProject } },
                props: { inputValues: { project: newProject } },
            }) => (
                newProject !== oldProject && newProject && newProject.length > 0
            ),
        },
    },

    organizationsRequest: {
        url: '/organizations/',
        query: ({ params }) => ({
            search: params.searchText,
            // limit: 30,
        }),
        method: methods.GET,
        onSuccess: ({ params, response }) => {
            params.setSearchedOrganizations(response.results);
        },
        options: {
            delay: 300,
        },
    },
    leadCreateRequest: {
        url: '/leads/',
        method: methods.POST,
        body: ({ params }) => ({
            ...params.values,
            sourceType: 'website',
        }),
        extras: {
            schemaName: 'array.lead',
        },
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
