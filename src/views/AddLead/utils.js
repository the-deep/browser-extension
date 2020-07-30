import {
    listToMap,
    isNotDefined,
    isDefined,
    compareNumber,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

export function fillOrganization(inputValues, organizationField, organization) {
    const organizationId = organization.id;
    if (!organizationId) {
        return inputValues;
    }

    const values = { ...inputValues };
    if (organizationField === 'author') {
        if (isDefined(values.authors)) {
            values.authors = [...values.authors, organizationId];
        } else {
            values.authors = [organizationId];
        }
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
        isNotDefined(values.confidentiality)
        && isDefined(leadOptions.confidentiality)
        && leadOptions.confidentiality.length > 0
    ) {
        values.confidentiality = leadOptions.confidentiality[0].key;
    }
    if (
        isNotDefined(values.priority)
        && isDefined(leadOptions.priority)
        && leadOptions.priority.length > 0
    ) {
        const sortedPriority = [...leadOptions.priority].sort(
            (a, b) => compareNumber(a.key, b.key),
        );
        values.priority = sortedPriority[0].key;
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
        values.authors = [webInfo.author.id];
    }
    return values;
}
export function isUrlValid(url) {
    return (requiredCondition(url).ok && urlCondition(url).ok);
}

export function trimFileExtension(title) {
    // Note: Removes string if . is followed by 1-5 lettered words
    return title.replace(/(\.\w{1,5})+$/, '');
}

export function formatTitle(filename) {
    if (isFalsyString(filename)) {
        return undefined;
    }

    let title = trimFileExtension(filename);
    // Note: Replaces multiple consecutive - & _ with single -
    title = title.replace(/[-_]{2,}/g, ' - ')
        // Note: Replaces all _ with space
        .replace(/_+/g, ' ')
        // Note: Replace all '-' except between two numbers
        .replace(/([^0-9\s])-([^\s])/g, (_, a, b) => `${a} ${b}`)
        .replace(/([^\s])-([^0-9\s])/g, (_, a, b) => `${a} ${b}`);

    return title;
}

export function getTitleFromUrl(url) {
    if (!isUrlValid(url)) {
        return undefined;
    }
    const decodedUrl = decodeURI(url);
    // Note: Gets string after last '/' and before '?" if '?' exists
    const match = decodedUrl.match(/\/([^/?]+)(?:\?.*)?$/);
    if (isNotDefined(match)) {
        return undefined;
    }

    return formatTitle(match[1]);
}

// Note: Replaces the first a-z character to uppercase and rest to lowercase
export function capitalizeOnlyFirstLetter(string) {
    if (isFalsyString(string)) {
        return string;
    }
    return string
        .toLowerCase()
        .replace(/[a-z]/, val => val.toUpperCase());
}
