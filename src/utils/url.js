// eslint-disable-next-line import/prefer-default-export
export const getWebsiteFromUrl = (url = '') => {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const website = `${protocol}//${host}`;
    return website;
};
