const getWebsiteFromUrl = (url) => {
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const website = `${protocol}//${host}`;
    return website;
};

const emptyObject = {};

// TODO: make common constant for webpage as well
const EXTENSION_GET_SCREENSHOT_MESSAGE = 'get-screenshot';
const EXTENSION_SET_TOKEN_MESSAGE = 'set-token';
const EXTENSION_SET_TOKEN_FG_MESSAGE = 'set-token-fg';
const EXTENSION_GET_TOKEN_MESSAGE = 'get-token';

// Message handler for messages from external source (eg: from website, other extension)
chrome.runtime.onMessageExternal.addListener((request, sender, reply) => {
    switch (request.message) {
        case EXTENSION_GET_SCREENSHOT_MESSAGE: {
            chrome.tabs.captureVisibleTab(null, {}, (image) => {
                reply({
                    message: 'success',
                    image,
                });
            });

            // return true to indicate that the reply is async
            return true;
        }

        case EXTENSION_SET_TOKEN_MESSAGE: {
            const { token } = request;
            const senderWebsite = getWebsiteFromUrl(sender.url);
            chrome.storage.local.set({
                [`token ${senderWebsite}`]: token,
            }, () => {
                const newRequest = {
                    message: EXTENSION_SET_TOKEN_FG_MESSAGE,
                    sender: senderWebsite,
                    token,
                };
                chrome.runtime.sendMessage(newRequest);
                reply({ message: 'success' });
            });
            return true;
        }

        default:
            return false;
    }
});

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (chrome.runtime.id !== sender.id) {
        return false;
    }

    switch (request.message) {
        case EXTENSION_GET_TOKEN_MESSAGE: {
            // Acknowledge token request
            const { website } = request;
            chrome.storage.local.get(`token ${website}`, (token) => {
                // NOTE: token may be null
                reply((token || emptyObject)[`token ${website}`]);
            });
            return true;
        }

        default:
            return false;
    }
});
