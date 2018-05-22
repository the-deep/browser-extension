import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import MultiViewContainer from './vendor/react-store/components/View/MultiViewContainer';
import Message from './vendor/react-store/components/View/Message';
import AccentButton from './vendor/react-store/components/Action/Button/AccentButton';

import { createUrlForBrowserExtensionPage } from './rest/web.js';
import { getWebsiteFromUrl } from './utils/url';
import TokenRefresh from './requests/TokenRefresh.js';

import AddLead from './views/AddLead';
import Settings from './views/Settings';
import Navbar from './views/Navbar';

import styles from './styles.scss';

import {
    setTokenAction,
    setCurrentTabInfoAction,
    tokenSelector,
    webServerAddressSelector,
} from './redux';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    webServerAddress: webServerAddressSelector(state),
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
    webServerAddress: PropTypes.string.isRequired,
};

const defaultProps = {
};

const currentTabQueryInfo = {
    active: true,
    currentWindow: true,
};

const EXTENSION_GET_TOKEN_MESSAGE = 'get-token';
const EXTENSION_SET_TOKEN_FG_MESSAGE = 'set-token-fg';

const ADD_LEAD_VIEW = 'addLead';
const SETTINGS_VIEW = 'settings';

const navbarTitle = {
    [ADD_LEAD_VIEW]: 'Add Lead',
    [SETTINGS_VIEW]: 'Settings',
};

const notAuthenticatedMessage = 'You need to log in to the DEEP first';
const loadingMessage = 'Initalizing...';

const informationIcon = 'ion-ios-information-outline';
const closeIcon = 'ion-ios-close-outline';
// const serverCommunicationErrorMessage = 'Failed to communicate with the server';

@connect(mapStateToProps, mapDispatchToProps)
class App extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingTokenRefresh: true,
            pendingTabInfo: true,
            authenticated: false,
            activeView: ADD_LEAD_VIEW,
        };

        this.tokenRefresh = new TokenRefresh({
            setState: d => this.setState(d),
            setToken: props.setToken,
        });

        this.views = {
            addLead: {
                component: () => {
                    const { authenticated } = this.state;
                    if (authenticated) {
                        return (
                            <AddLead className={styles.addLead} />
                        );
                    }

                    const AppMessage = this.renderMessage;
                    return <AppMessage />;
                },
            },

            settings: {
                component: () => (
                    <Settings className={styles.settings} />
                ),
            },
        };
    }

    componentWillMount() {
        // set handler for message from background
        chrome.runtime.onMessage.addListener(this.handleMessageReceive);

        this.getCurrentTabInfo();

        const { webServerAddress } = this.props;

        if (webServerAddress) {
            this.getTokenFromBackground(webServerAddress);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { webServerAddress: newWebServerAddress } = nextProps;
        const { webServerAddress: oldWebServerAddress } = this.props;

        if (oldWebServerAddress !== newWebServerAddress) {
            this.getTokenFromBackground(newWebServerAddress);
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

    getTokenFromBackground = (website) => {
        chrome.runtime.sendMessage({
            message: EXTENSION_GET_TOKEN_MESSAGE,
            website,
        }, this.handleGetTokenFromBackgroundResponse);
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

    handleGetTokenFromBackgroundResponse = (response = {}) => {
        const token = response;
        const { setToken } = this.props;

        setToken({ token });
        if (token && token.refresh) {
            this.tokenRefresh.create(token);
            this.tokenRefresh.request.start();
        } else {
            this.setState({
                pendingTabInfo: false,
                pendingTokenRefresh: false,
                authenticated: false,
            });
            chrome.tabs.create({
                url: createUrlForBrowserExtensionPage(),
                active: false,
            });
        }
    }

    handleMessageReceive = (request, messageSender) => {
        if (chrome.runtime.id === messageSender.id) {
            return;
        }

        const {
            message,
            token,
            sender,
        } = request;

        switch (message) {
            case EXTENSION_SET_TOKEN_FG_MESSAGE: {
                const {
                    setToken,
                    webServerAddress,
                } = this.props;

                const website = getWebsiteFromUrl(webServerAddress);
                if (sender === website) {
                    console.info('Received token through background', token);
                    setToken({ token });
                }
                break;
            }
            default:
                console.warn('Unknown message', message);
        }
    }

    handleSettingsButtonClick = () => {
        this.setState({ activeView: SETTINGS_VIEW });
    }

    handleBackButtonClick = () => {
        this.setState({ activeView: ADD_LEAD_VIEW });
    }

    renderMessage = () => {
        const iconClassNames = [styles.icon];

        const {
            pendingTokenRefresh,
            pendingTabInfo,
            error,
        } = this.state;

        if (pendingTabInfo || pendingTokenRefresh) {
            return (
                <Message className={styles.loadingMessage}>
                    <div className={styles.message}>
                        { loadingMessage }
                    </div>
                </Message>
            );
        }

        if (error !== undefined) {
            iconClassNames.push(closeIcon);
            return (
                <Message className={styles.errorMessage}>
                    <div className={iconClassNames.join(' ')} />
                    <div className={styles.message}>
                        { error }
                    </div>
                </Message>
            );
        }

        iconClassNames.push(informationIcon);
        return (
            <Message className={styles.notAuthenticatedMessage}>
                <div className={iconClassNames.join(' ')} />
                <div className={styles.message}>
                    { notAuthenticatedMessage }
                </div>
            </Message>
        );
    }

    renderNavbarRightComponent = () => {
        const { activeView } = this.state;

        switch (activeView) {
            case ADD_LEAD_VIEW:
                return (
                    <AccentButton
                        transparent
                        className={styles.navButton}
                        onClick={this.handleSettingsButtonClick}
                        iconName="ion-android-settings"
                    />
                );
            case SETTINGS_VIEW:
                return (
                    <AccentButton
                        transparent
                        className={styles.navButton}
                        onClick={this.handleBackButtonClick}
                        iconName="ion-android-arrow-back"
                    />
                );
            default:
                return null;
        }
    }

    render() {
        const { activeView } = this.state;

        const NavbarRightComponent = this.renderNavbarRightComponent;

        return (
            <div className={styles.app}>
                <Navbar
                    className={styles.navbar}
                    rightComponent={NavbarRightComponent}
                    title={navbarTitle[activeView]}
                />
                <MultiViewContainer
                    views={this.views}
                    active={activeView}
                />
            </div>
        );
    }
}

export default App;
