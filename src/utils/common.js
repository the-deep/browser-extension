import {
    isDefined,
    isNotDefined,
    isObject,
    isList,
} from '@togglecorp/fujs';

const forEach = (obj, func) => {
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        func(key, val);
    });
};

// eslint-disable-next-line import/prefer-default-export
export const sanitizeResponse = (data) => {
    if (isNotDefined(data)) {
        return undefined;
    }
    if (isList(data)) {
        return data.map(sanitizeResponse).filter(isDefined);
    }
    if (isObject(data)) {
        let newData = {};
        forEach(data, (k, val) => {
            const newEntry = sanitizeResponse(val);
            if (isDefined(newEntry)) {
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
