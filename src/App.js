import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import MultiViewContainer from './vendor/react-store/components/View/MultiViewContainer';
import AddLead from './views/AddLead';
import Settings from './views/Settings';
import Navbar from './views/Navbar';

import {
    setTokenAction,
    setCurrentTabInfoAction,
    tokenSelector,
    serverAddressSelector,
} from './redux';

import AccentButton from './vendor/react-store/components/Action/Button/AccentButton';

import {
    createUrlForBrowserExtensionPage,
} from './rest/web.js';

import {
    getWebsiteFromUrl,
} from './utils/url';

import TokenRefresh from './requests/TokenRefresh.js';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    serverAddress: serverAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setToken: params => dispatch(setTokenAction(params)),
});

const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
        refresh: PropTypes.string,
    }).isRequired,
    setCurrentTabInfo: PropTypes.func.isRequired,
    setToken: PropTypes.func.isRequired,
    serverAddress: PropTypes.string.isRequired,
};

const defaultProps = {
};

const ADD_LEAD_VIEW = 'add-lead';
const SETTINGS_VIEW = 'settings-view';

const currentTabQueryInfo = {
    active: true,
    currentWindow: true,
};

const EXTENSION_GET_TOKEN_MESSAGE = 'get-token';
const EXTENSION_SET_TOKEN_FG_MESSAGE = 'set-token-fg';

const notAuthenticatedMessage = 'You need to login to deep first';
const ErrorMessage = (p) => {
    const { children } = p;

    return (
        <div className="error-message">
            { children }
        </div>
    );
};

@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingTokenRefresh: false,
            pendingTabInfo: false,
            authenticated: false,
            errorMessage: undefined,
            currentView: ADD_LEAD_VIEW,
            activeView: 'addLead',
        };

        this.tokenRefresh = new TokenRefresh({
            setState: d => d.setState(d),
        });

        this.views = {
            addLead: {
                component: () => {
                    const { authenticated } = this.state;
                    if (authenticated) {
                        return <AddLead />;
                    }

                    return (
                        <ErrorMessage>
                            { notAuthenticatedMessage }
                        </ErrorMessage>
                    );
                },
            },

            settings: {
                component: Settings,
            },
        };
    }

    componentWillMount() {
        chrome.runtime.onMessage.addListener(this.handleMessageReceive);
        this.getCurrentTabInfo();

        const { serverAddress } = this.props;
        if (serverAddress) {
            this.getTokenFromBackground(serverAddress);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { serverAddress: newServerAddress } = nextProps;
        const { serverAddress: oldServerAddress } = this.props;

        if (oldServerAddress !== newServerAddress) {
            this.getTokenFromBackground(newServerAddress);
        } else {
            const { token: newToken } = nextProps;
            const { token: oldToken } = this.props;

            if (newToken.refresh !== oldToken.refresh) {
                if (newToken.refresh) {
                    this.tokenRefresh.create(newToken);
                    this.tokenRefresh.request.start();
                } else {
                    this.setState({ authenticated: false });
                }
            }
        }
    }

    componentWillUnmount() {
        this.tokenRefresh.request.stop();
        chrome.runtime.onMessage.removeListener(this.handleMessageReceive);
    }

    getTokenFromBackground = (serverAddress) => {
        const webServerAddress = getWebsiteFromUrl(serverAddress.web);

        chrome.runtime.sendMessage({
            message: EXTENSION_GET_TOKEN_MESSAGE,
            website: webServerAddress,
        }, this.handleGetTokenMessageResponse);
    }

    getCurrentTabInfo = () => {
        const queryCallback = (tabs) => {
            const { setCurrentTabInfo } = this.props;

            const tab = tabs[0];
            const {
                url,
                url: tabId,
            } = tab;

            setCurrentTabInfo({
                tabId,
                url,
            });

            this.setState({ pendingTabInfo: false });
        };

        chrome.tabs.query(currentTabQueryInfo, queryCallback);
    }

    handleGetTokenMessageResponse = (response = {}) => {
        const token = response;
        const { setToken } = this.props;

        setToken({ token });

        if (token && token.refresh) {
            console.info('Got token from bg', token);
            this.tokenRefresh.create(token);
            this.tokenRefresh.request.start();
        } else {
            this.setState({
                authenticated: false,
            });

            chrome.tabs.create({
                url: createUrlForBrowserExtensionPage(),
                active: false,
            });
        }
    }

    handleMessageReceive = (request, sender) => {
        if (chrome.runtime.id === sender.id) {
            if (request.message === EXTENSION_SET_TOKEN_FG_MESSAGE) {
                const {
                    setToken,
                    serverAddress,
                } = this.props;

                const website = getWebsiteFromUrl(serverAddress.web);

                if (request.sender === website) {
                    console.info('Got token from site', request.token);
                    setToken({ token: request.token });
                }
            }
        }
    }

    handleAddLeadSettingsButtonClick = () => {
        this.setState({
            currentView: SETTINGS_VIEW,
        });
    }

    handleSettingsButtonClick = () => {
        this.setState({ activeView: 'settings' });
    }

    handleBackButtonClick = () => {
        this.setState({ activeView: 'addLead' });
    }

    renderNavbarRightComponent = () => {
        const { activeView } = this.state;

        switch (activeView) {
            case 'addLead':
                return (
                    <AccentButton
                        transparent
                        onClick={this.handleSettingsButtonClick}
                    >
                        Settings
                    </AccentButton>
                );
            case 'settings':
                return (
                    <AccentButton
                        transparent
                        onClick={this.handleBackButtonClick}
                    >
                        Back
                    </AccentButton>
                );
            default:
                return null;
        }
    }

    render() {
        const {
            pendingTokenRefresh,
            pendingTabInfo,
            authenticated,
            currentView,
            activeView,
            errorMessage,
        } = this.state;

        const pending = pendingTabInfo || pendingTokenRefresh;
        const Message = this.renderMessage;
        const NavbarRightComponent = this.renderNavbarRightComponent;

        return (
            <React.Fragment>
                <Navbar rightComponent={NavbarRightComponent} />
                <MultiViewContainer
                    views={this.views}
                    active={activeView}
                />
            </React.Fragment>
        );

        /*
        if (currentView === SETTINGS_VIEW) {
            return (
                <Settings
                    onBackButtonClick={this.handleSettingsBackButtonClick}
                />
            );
        }

        if (errorMessage) {
            return <Message message={errorMessage} />;
        }

        if (pending) {
            return <Message message="Loading..." />;
        }

        return (
            authenticated ? (
                <AddLead
                    onSettingsButtonClick={this.handleAddLeadSettingsButtonClick}
                />
            ) : (
                <Message message="You need to login to deep first" />
            )
        );
        */
    }
}

export default App;
