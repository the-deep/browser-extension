// import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line no-unused-vars
const emptyObject = {}; // eslint-disable-line no-unused-vars


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

export const uiStateForTabSelector = ({ domainData, mem }) => {
    const { currentTabId } = mem;

    if (currentTabId) {
        const tabData = domainData[currentTabId];

        if (tabData) {
            return tabData.uiState || emptyObject;
        }
    }

    return emptyObject;
};
