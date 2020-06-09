import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { iconNames } from '#constants';
import AccentButton from '#rsca/Button/AccentButton';
import { addIcon } from '#rscg/Icon';
import MultiViewContainer from '#rscv/MultiViewContainer';

import {
    setTokenAction,
    setCurrentTabInfoAction,
    tokenSelector,
    webServerAddressSelector,
    clearDomainDataAction,
} from '#redux';

import {
    RequestCoordinator,
    createRequestClient,
    methods,
    createUrlForBrowserExtensionPage,
} from '#request';

import AddLead from '#views/AddLead';
import AddOrganization from '#views/AddOrganization';
import Settings from '#views/Settings';
import Navbar from '#views/Navbar';
import authLayer from '#views/authLayer';

import styles from './styles.scss';

const AuthenticatedAddLead = authLayer(AddLead);
const AuthenticatedAddOrganization = authLayer(AddOrganization);

const mapStateToProps = state => ({
    token: tokenSelector(state),
    webServerAddress: webServerAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setToken: params => dispatch(setTokenAction(params)),
    clearDomainData: () => dispatch(clearDomainDataAction()),
});

const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
        refresh: PropTypes.string,
    }).isRequired,
    setCurrentTabInfo: PropTypes.func.isRequired,
    setToken: PropTypes.func.isRequired,
    webServerAddress: PropTypes.string.isRequired,
    clearDomainData: PropTypes.func.isRequired,
    requests: PropTypes.shape({
        tokenRefreshRequest: PropTypes.object.isRequired,
    }).isRequired,
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
const ADD_ORGANIZATION_VIEW = 'addOrganization';

const navbarTitle = {
    [ADD_LEAD_VIEW]: 'Add Lead',
    [SETTINGS_VIEW]: 'Settings',
    [ADD_ORGANIZATION_VIEW]: 'Add Organization',
};

const tokenRefreshFatalErrorMessage = 'Failed to communicate with the server';
const tokenRefreshFailureMessage = 'Failed to refresh token';

Object.keys(iconNames).forEach((key) => {
    addIcon('font', key, iconNames[key]);
});

const requests = {
    tokenRefreshRequest: {
        url: '/token/refresh/',
        method: methods.POST,
        body: ({ params }) => ({ refresh: (params.token || {}).refresh }),
        onSuccess: ({
            props: { setToken, token },
            response,
            params: {
                setAuthAndError,
            },
        }) => {
            const tokenObject = {
                ...token,
                access: response.access,
            };
            setToken(tokenObject);
            setAuthAndError(true);
        },
        onFailure: ({ params: { setAuthAndError } }) => {
            setAuthAndError(false, tokenRefreshFailureMessage);
        },
        onFatal: ({ params: { setAuthAndError } }) => {
            setAuthAndError(false, tokenRefreshFatalErrorMessage);
        },
        extras: {
            schemaName: 'token',
        },
    },
};

class App extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingTabInfo: true,
            authenticated: false,
            activeView: ADD_LEAD_VIEW,
            navState: undefined,
        };

        this.views = {
            [ADD_LEAD_VIEW]: {
                rendererParams: () => {
                    const {
                        authenticated,
                        pendingTabInfo,
                        error,
                    } = this.state;
                    const {
                        requests: {
                            tokenRefreshRequest: {
                                pending: pendingTokenRefresh,
                            },
                        },
                    } = this.props;

                    return {
                        className: styles.addLead,

                        authenticated,
                        pending: pendingTabInfo || pendingTokenRefresh,
                        error,

                        setNavState: this.setNavState,
                        getNavState: this.getNavState,

                        goToAddOrganization: this.goToAddOrganization,
                    };
                },
                component: AuthenticatedAddLead,
            },

            [ADD_ORGANIZATION_VIEW]: {
                rendererParams: () => {
                    const {
                        authenticated,
                        pendingTabInfo,
                        error,
                    } = this.state;
                    const {
                        requests: {
                            tokenRefreshRequest: {
                                pending: pendingTokenRefresh,
                            },
                        },
                    } = this.props;

                    return {
                        className: styles.addLead,

                        setNavState: this.setNavState,
                        getNavState: this.getNavState,

                        authenticated,
                        pending: pendingTabInfo || pendingTokenRefresh,
                        error,
                    };
                },
                component: AuthenticatedAddOrganization,
            },

            [SETTINGS_VIEW]: {
                rendererParams: () => ({
                    className: styles.settings,

                    setNavState: this.setNavState,
                    getNavState: this.getNavState,
                }),
                component: Settings,
            },
        };

        this.headerViews = {
            [ADD_LEAD_VIEW]: {
                component: AccentButton,
                rendererParams: () => ({
                    transparent: true,
                    className: styles.navButton,
                    onClick: this.goToSettings,
                    iconName: 'settings',
                }),
            },
            [ADD_ORGANIZATION_VIEW]: {
                component: AccentButton,
                rendererParams: () => ({
                    transparent: true,
                    className: styles.navButton,
                    onClick: this.goToAddLead,
                    iconName: 'back',
                }),
            },
            [SETTINGS_VIEW]: {
                component: AccentButton,
                rendererParams: () => ({
                    transparent: true,
                    className: styles.navButton,
                    onClick: this.goToAddLead,
                    iconName: 'back',
                }),
            },
        };
    }

    componentDidMount() {
        // set handler for message from background
        chrome.runtime.onMessage.addListener(this.handleMessageReceive);
        chrome.tabs.query(currentTabQueryInfo, this.handleCurrentTabInfoQuery);

        const { webServerAddress } = this.props;
        if (webServerAddress) {
            this.requestTokenFromBackground(webServerAddress);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            clearDomainData,
            requests: {
                tokenRefreshRequest,
            },

            webServerAddress: oldWebServerAddress,
            token: oldToken,
        } = this.props;
        const {
            webServerAddress: newWebServerAddress,
            token: newToken,
        } = nextProps;

        if (oldWebServerAddress !== newWebServerAddress) {
            clearDomainData();
            this.requestTokenFromBackground(newWebServerAddress);
        } else if (newToken.refresh !== oldToken.refresh) {
            if (newToken.refresh) {
                tokenRefreshRequest.do({
                    token: newToken,
                    setAuthAndError: this.handleErrorAndAuthChange,
                });
            } else {
                this.setState({ authenticated: false });
            }
        }
    }

    componentWillUnmount() {
        chrome.runtime.onMessage.removeListener(this.handleMessageReceive);
    }

    requestTokenFromBackground = (website) => {
        chrome.runtime.sendMessage(
            {
                message: EXTENSION_GET_TOKEN_MESSAGE,
                website,
            },
            this.handleGetTokenFromBackgroundResponse,
        );
    }

    handleCurrentTabInfoQuery = (tabs) => {
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
    }

    handleGetTokenFromBackgroundResponse = (response = {}) => {
        const token = response;
        const {
            setToken,
            requests: {
                tokenRefreshRequest,
            },
        } = this.props;

        setToken(token);

        if (token && token.refresh) {
            tokenRefreshRequest.do({
                token,
                setAuthAndError: this.handleErrorAndAuthChange,
            });
        } else {
            chrome.tabs.create({
                url: createUrlForBrowserExtensionPage(),
                active: false,
            });
            this.setState({
                pendingTabInfo: false,
                authenticated: false,
            });
        }
    }

    handleMessageReceive = (request, messageSender) => {
        if (chrome.runtime.id !== messageSender.id) {
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

                if (sender === webServerAddress) {
                    console.info('Received token through background', token);
                    setToken(token);
                }
                break;
            }
            default:
                console.warn('Unknown message', message);
        }
    }

    handleErrorAndAuthChange = (authenticated, error) => {
        this.setState({
            error,
            authenticated,
        });
    }

    goToPage = (pageName) => {
        const { navState } = this.state;
        if (navState && navState.receiver !== pageName) {
            console.warn(`Clearing stale navState for ${navState.receiver}`);
            this.setState({
                navState: undefined,
            });
        }

        this.setState({
            activeView: pageName,
        });
    }

    getNavState = () => {
        const {
            navState,
        } = this.state;
        console.warn('Reading navState', navState);
        return navState;
    }

    setNavState = ({ sender, receiver, data }) => {
        const newNavState = {
            sender,
            receiver,
            data,
        };
        console.warn('Writing navState', newNavState);
        this.setState({
            navState: newNavState,
        });
    }

    goToSettings = () => {
        this.goToPage(SETTINGS_VIEW);
    }

    goToAddLead = () => {
        this.goToPage(ADD_LEAD_VIEW);
    }

    goToAddOrganization = () => {
        this.goToPage(ADD_ORGANIZATION_VIEW);
    }

    render() {
        const { activeView } = this.state;

        return (
            <div className={styles.app}>
                <Navbar
                    className={styles.navbar}
                    title={navbarTitle[activeView]}
                    rightComponent={(
                        <MultiViewContainer
                            views={this.headerViews}
                            active={activeView}
                        />
                    )}
                />
                <MultiViewContainer
                    views={this.views}
                    active={activeView}
                />
            </div>
        );
    }
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    RequestCoordinator,
    createRequestClient(requests),
)(App);
