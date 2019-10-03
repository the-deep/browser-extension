import { listToMap } from '@togglecorp/fujs';

export function fillOrganization(inputValues, organizationField, organization) {
    const values = { ...inputValues };
    const organizationId = organization.id;
    if (organizationField === 'author') {
        values.author = organizationId;
    } else if (organizationField === 'publisher') {
        values.source = organizationId;
    }
    return values;
}

export function fillExtraInfo(inputValues, currentUserId, leadOptions = {}) {
    const values = { ...inputValues };

    if (!values.assignee) {
        values.assignee = currentUserId;
    } else {
        const memberMapping = listToMap(
            leadOptions.members,
            member => member.id,
            () => true,
        );
        if (!memberMapping[values.assignee]) {
            values.assignee = undefined;
        }
    }

    if (
        !values.confidentiality
        && leadOptions.confidentiality
        && leadOptions.confidentiality.length > 0
    ) {
        values.confidentiality = leadOptions.confidentiality[0].key;
    }

    return values;
}

export function fillWebInfo(inputValues, webInfo) {
    const values = { ...inputValues };
    if ((!values.project || values.project.length <= 0) && webInfo.project) {
        values.project = [webInfo.project];
    }
    if (webInfo.date) {
        values.publishedOn = webInfo.date;
    }
    if (webInfo.website) {
        values.website = webInfo.website;
    }
    if (webInfo.title) {
        values.title = webInfo.title;
    }
    if (webInfo.url) {
        values.url = webInfo.url;
    }
    if (webInfo.source) {
        values.source = webInfo.source.id;
    }
    if (webInfo.author) {
        values.author = webInfo.author.id;
    }
    return values;
}
