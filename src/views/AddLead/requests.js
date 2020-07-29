import { unique, isDefined } from '@togglecorp/fujs';

import { methods } from '#request';

// TODO: block if failure for projectsListRequest and leadOptionsRequest

const requestOptions = {
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
        query: ({ props: { currentTabId } }) => ({ url: currentTabId }),
        method: methods.GET,
        onMount: ({
            props: {
                currentTabId,
                getNavState,
            },
        }) => {
            const navState = getNavState();
            // NOTE: If we come from another page navState is present
            // When navState is present we don't want to call this api again
            // and reset the data
            if (isDefined(navState)) {
                return false;
            }
            return currentTabId && currentTabId.length > 0;
        },
        onPropsChanged: ['currentTabId'],
        onSuccess: ({ props: { requests, currentTabId }, response }) => {
            if (requests.webInfoDataRequest) {
                requests.webInfoDataRequest.do({
                    url: currentTabId,
                    title: response.title,
                    date: response.date,
                    website: response.website,
                    country: response.country,
                    source: response.sourceRaw,
                    author: response.authorRaw,
                });
            }
        },
        extras: {
            type: 'serverless',
            // schemaName: 'webInfo',
        },
    },

    webInfoDataRequest: {
        url: '/v2/web-info-data/',
        body: ({ params: {
            source,
            author,
            country,
            url,
        } }) => ({
            sourceRaw: source,
            authorRaw: author,
            country,
            url,
        }),
        method: methods.POST,
        onSuccess: ({ params, response }) => {
            params.handleWebInfoFill({
                date: params.date,
                website: params.website,
                title: params.title,
                url: params.url,
                ...response,
            });
        },
        onFailure: ({ params }) => {
            // NOTE: Even on failure fill data from webInfoExtract
            params.handleWebInfoFill({
                date: params.date,
                website: params.website,
                title: params.title,
                url: params.url,
            });
        },
    },

    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.POST,
        body: ({ props: { inputValues } }) => ({
            projects: inputValues.project,
            leadGroups: [], // this will not fetch
            emmEntities: [], // this will not fetch
            emmKeywords: [], // this will not fetch
            emmRiskFactors: [], // this will not fetch
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
        url: '/v2/leads/',
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
                targetUrl = `${webServerAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/entries/edit/`;
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

export default requestOptions;
