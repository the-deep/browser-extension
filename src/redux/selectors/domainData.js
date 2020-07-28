// import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyObject = {};
const emptyList = [];

export const inputValuesForTabSelector = ({ domainData, mem }) => {
    const { currentTabId } = mem;

    if (currentTabId) {
        const tabData = domainData[currentTabId];

        if (tabData) {
            return tabData.inputValues || {
                authors: [],
                priority: 'low',
            };
        }
    }

    return emptyObject;
};

export const organizationsForTabSelector = ({ domainData, mem }) => {
    const { currentTabId } = mem;

    if (currentTabId) {
        const tabData = domainData[currentTabId];

        if (tabData) {
            return tabData.organizations || emptyList;
        }
    }

    return emptyList;
};
