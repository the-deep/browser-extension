const leadAddSchema = [];

{
    const name = 'keyValue';
    const schema = {
        doc: {
            name: 'keyValue',
            description: 'Schema for key-value',
        },
        fields: {
            key: { type: 'string' },
            value: { type: 'string' },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'keyValueNS';
    const schema = {
        doc: {
            name: 'keyValueNS',
            description: 'Schema for key as number and value as string',
        },
        fields: {
            key: { type: 'number' },
            value: { type: 'string' },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'confidentiality';
    const schema = {
        doc: {
            name: 'confidentiality',
            description: 'Schema for confidentiality',
        },
        extends: 'keyValue',
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'status';
    const schema = {
        doc: {
            name: 'status',
            description: 'Schema for status',
        },
        extends: 'keyValue',
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'member';
    const schema = {
        doc: {
            name: 'member',
            description: 'Schema for member',
        },
        fields: {
            id: { type: 'uint', required: true },
            email: { type: 'string', required: true },
            displayName: { type: 'string', required: true },
            displayPicture: { type: 'uint' },
        },
    };
    leadAddSchema.push({ name, schema });
}

{
    const name = 'organization';
    const schema = {
        doc: {
            name: 'organization',
            description: 'Schema for organization',
        },
        fields: {
            id: { type: 'uint' },
            title: { type: 'string' },
            mergedAs: {
                type: {
                    doc: {
                        name: 'parentOrganization',
                        description: 'Schema for parent organization',
                    },
                    fields: {
                        id: { type: 'uint' },
                        title: { type: 'string' },
                    },
                },
            },
        },
    };
    leadAddSchema.push({ name, schema });
}

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
            source: { type: 'organization' },
            sourceRaw: { type: 'string' },
            author: { type: 'organization' },
            authorRaw: { type: 'string' },
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
            hasEmmLeads: { type: 'boolean' },
            projects: { type: 'array.unknown' },
            leadGroups: { type: 'array.unknown' },
            emmEntities: { type: 'array.unknown' },
            emmKeywords: { type: 'array.unknown' },
            emmRiskFactors: { type: 'array.unknown' },
            status: { type: 'array.status' },
            members: { type: 'array.member' },
            organizations: {
                type: 'array.organization',
            },
            confidentiality: { type: 'array.confidentiality' },
            priority: { type: 'array.keyValueNS' },
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
            assigneeDetails: { type: 'member' },
            attachment: { type: 'object' }, // file url
            confidentiality: { type: 'string', required: true },
            noOfEntries: { type: 'int' },
            project: { type: 'uint' },
            publishedOn: { type: 'string' },
            source: { type: 'uint' }, // url
            author: { type: 'uint' }, // url
            authors: { type: 'array.uint' }, // url
            sourceRaw: { type: 'string' }, // url
            authorRaw: { type: 'string' }, // url
            sourceDetail: { type: 'unknown' },
            authorDetail: { type: 'unknown' },
            authorsDetail: { type: 'array.unknown' },
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
            emmEntities: { type: 'array.uknown' },
            emmTriggers: { type: 'array.uknown' },
        },
    };
    leadAddSchema.push({ name, schema });
}

export default leadAddSchema;
