const tokenSchema = [];

{
    const name = 'token';
    const schema = {
        doc: {
            name: 'Token',
            description: 'Token refresh request',
        },
        fields: {
            access: { type: 'string', required: true },
        },
    };
    tokenSchema.push({ name, schema });
}

export default tokenSchema;
