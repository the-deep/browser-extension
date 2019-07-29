export const alterResponseErrorToFaramError = (e) => {
    let errors = e;

    if (Array.isArray(e)) {
        errors = e.reduce(
            (acc, error) => {
                const {
                    // eslint-disable-next-line no-unused-vars
                    internalNonFieldErrors = [],
                    nonFieldErrors = [],
                    ...formFieldErrors
                } = error;

                acc.nonFieldErrors = acc.nonFieldErrors.concat(nonFieldErrors);

                Object.keys(formFieldErrors || {}).forEach(
                    (key) => {
                        if (acc[key]) {
                            // append only unique errors
                            const newErrors = error[key].filter(
                                d => acc[key].indexOf(d) === -1,
                            );
                            acc[key] = acc[key].concat(newErrors);
                        } else {
                            acc[key] = [...error[key]];
                        }
                    },
                );
                return acc;
            },
            {
                nonFieldErrors: [],
            },
        );
    }

    const {
        // eslint-disable-next-line no-unused-vars
        internalNonFieldErrors = [],
        nonFieldErrors = [],
        ...formFieldErrorList
    } = errors;

    return Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {
            $internal: nonFieldErrors,
        },
    );
};

export const alterAndCombineResponseError = errors => (
    Object.values(alterResponseErrorToFaramError(errors))
);
