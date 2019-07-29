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
    const name = 'lead';
    const schema = {
        doc: {
            name: 'leads',
            description: 'Schema for leads /leads/',
        },
        fields: {
            id: { type: 'uint', required: true },
            project: { type: 'uint', required: true },
        },
    };
    leadAddSchema.push({ name, schema });
}

export default leadAddSchema;
