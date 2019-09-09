import Dict, { basicTypes } from '@togglecorp/ravl';

import token from './token';
import leadAdd from './leadAdd';

const basicTypeSchemas = basicTypes.map(entry => ({ name: entry.doc.name, schema: entry }));

const userDefinedSchemas = [];

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

const enableLogging = process.env.REACT_APP_RAVL_WARNING !== 'disable';
const dict = new Dict({
    warning: enableLogging,
});

[
    ...basicTypeSchemas,
    ...userDefinedSchemas,
    ...token,
    ...leadAdd,
].forEach(({ name, schema }) => dict.put(name, schema));

export default dict;
