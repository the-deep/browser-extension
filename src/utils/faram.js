export const alterResponseErrorToFaramError = (errors) => {
    const { nonFieldErrors = [], ...formFieldErrorList } = errors;

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
