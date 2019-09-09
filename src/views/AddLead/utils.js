export function fillExtraInfo(inputValues, currentUserId, leadOptions = {}) {
    const values = { ...inputValues };
    if (!values.assignee) {
        values.assignee = currentUserId;
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
    if (!values.date && webInfo.date) {
        values.publishedOn = webInfo.date;
    }
    if (!values.website && webInfo.website) {
        values.website = webInfo.website;
    }
    if (!values.title && webInfo.title) {
        values.title = webInfo.title;
    }
    if (!values.url && webInfo.url) {
        values.url = webInfo.url;
    }
    if (!values.source && webInfo.source) {
        values.source = webInfo.source.id;
    }
    if (!values.author && webInfo.author) {
        values.author = webInfo.author.id;
    }
    return values;
}
