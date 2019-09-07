import {
    isDefined,
    isNotDefined,
    isObject,
    isList,
} from '@togglecorp/fujs';


// FIXME: this is not used
export const forEach = (obj, func) => {
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        func(key, val);
    });
};

// FIXME: this is not here
export const sanitizeResponse = (data) => {
    if (data === null || data === undefined) {
        return undefined;
    }
    if (isList(data)) {
        return data.map(sanitizeResponse).filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        forEach(data, (k, val) => {
            const newEntry = sanitizeResponse(val);
            // Comment from Bibek:
            // This was:
            // if (newEntry) {
            // But it failed when an empty string or 0 was returned.
            if (isNotDefined(newEntry)) {
                newData = {
                    ...newData,
                    [k]: newEntry,
                };
            }
        });
        return newData;
    }
    return data;
};
