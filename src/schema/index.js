import Dict, { basicTypes } from '@togglecorp/ravl';

const basicTypeSchemas = basicTypes.map(entry => ({ name: entry.doc.name, schema: entry }));

const userDefinedSchemas = [];

// TODO: add errorResponse and successResponse in RestRequest

{
    const name = 'dbentity';
    const schema = {
        doc: {
            name: 'Database Entity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            createdAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint' },
            createdByName: { type: 'string' },
            id: { type: 'uint', required: true },
            modifiedAt: { type: 'string', required: true }, // date
            modifiedBy: { type: 'uint' },
            modifiedByName: { type: 'string' },
            versionId: { type: 'uint', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}
{
    const name = 'keyValuePair';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair',
        },
        fields: {
            key: { type: 'uint', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}
{
    const name = 'keyValuePairSS';
    const schema = {
        doc: {
            name: 'Key Value Pair',
            description: 'Defines key value pair where key and value both are strings',
        },
        fields: {
            key: { type: 'string', required: true },
            value: { type: 'string', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}
{
    const name = 'timevalue';
    const schema = {
        doc: {
            name: 'Time Value',
            description: 'Array of timevalue represents a timeseries',
        },
        fields: {
            date: { type: 'string', required: true }, // date
            count: { type: 'uint', required: true },
        },
    };
    userDefinedSchemas.push({ name, schema });
}


const isBeta = process.env.REACT_APP_DEEP_ENVIRONMENT === 'beta';
const dict = new Dict(
    isBeta ? { warning: false } : { warning: true },
);

[
    ...basicTypeSchemas,
    ...userDefinedSchemas,
].forEach(({ name, schema }) => dict.put(name, schema));

export default dict;