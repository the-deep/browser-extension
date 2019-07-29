const leadAddSchema = [];

{
    const name = 'webInfo';
    const schema = {
        doc: {
            name: 'webInfoSchema',
            description: 'Schema for web extract info /web-info-extract/',
        },
        fields: {
            country: { type: 'string' },
            date: { type: 'string' },
            existing: { type: 'boolean', required: true },
            project: { type: 'uint' },
            source: { type: 'string' },
            title: { type: 'string' },
            url: { type: 'string' },
            website: { type: 'string' },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'leadOptions';
    const schema = {
        doc: {
            name: 'leadOptionsSchema',
            description: 'Schema for lead options /lead-options/',
        },
        fields: {
            assignee: { type: 'array.keyValuePair' },
            confidentiality: { type: 'array.keyValuePairSS' },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'project';
    const schema = {
        doc: {
            name: 'projectSchema',
            description: 'Schema for project item',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'projectsList';
    const schema = {
        doc: {
            name: 'projectsListSchema',
            description: 'Schema for projects list /projects/members-of/',
        },
        fields: {
            count: { type: 'uint', required: true },
            previous: { type: 'string' },
            next: { type: 'string' },
            results: { type: 'array.project', required: true },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'user-s';
    const schema = {
        doc: {
            name: 'User Small',
            description: 'Small Data for user',
        },
        fields: {
            displayPicture: { type: 'uint' },
            displayName: { type: 'string', required: true },
            email: { type: 'string', required: true },
            id: { type: 'uint', required: true },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'lead';
    const schema = {
        doc: {
            name: 'leads',
            description: 'Schema for leads /leads/',
        },
        extends: 'dbentity',
        fields: {
            sourceType: { type: 'string' }, // set is required later
            assignee: { type: 'uint' },
            leadGroup: { type: 'uint' },
            assigneeDetails: { type: 'user-s' },
            attachment: { type: 'object' }, // file url
            confidentiality: { type: 'string', required: true },
            noOfEntries: { type: 'int' },
            project: { type: 'uint' },
            publishedOn: { type: 'string' },
            source: { type: 'string' }, // url
            status: { type: 'string', required: true },
            text: { type: 'string' },
            title: { type: 'string', required: true },
            url: { type: 'string' },
            website: { type: 'string' },
            classifiedDocId: { type: 'number' },
            tabularBook: { type: 'uint' },
            pageCount: { type: 'int' },
            wordCount: { type: 'int' },
            thumbnailHeight: { type: 'int' },
            thumbnailWidth: { type: 'int' },
            thumbnail: { type: 'string' }, // url
        },
    };
    leadAddSchema.push({ name, schema });
}

export default leadAddSchema;
