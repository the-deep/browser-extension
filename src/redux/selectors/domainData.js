// import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyObject = {}; // eslint-disable-line no-unused-vars


// eslint-disable-next-line import/prefer-default-export
export const inputValuesForTabSelector = ({ domainData, mem }) => {
    const { currentTabId } = mem;

    if (currentTabId) {
        const tabData = domainData[currentTabId];

        if (tabData) {
            return tabData.inputValues || emptyObject;
        }
    }

    return emptyObject;
};
