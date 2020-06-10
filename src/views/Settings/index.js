import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import SegmentInput from '#rsci/SegmentInput';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    setSettingsAction,
    webServerAddressSelector,
    apiServerAddressSelector,
    serverlessAddressSelector,
    serverSelector,
} from '#redux';

import styles from './styles.scss';

const mapStateToProps = state => ({
    webServerAddress: webServerAddressSelector(state),
    apiServerAddress: apiServerAddressSelector(state),
    serverlessAddress: serverlessAddressSelector(state),
    server: serverSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSettings: params => dispatch(setSettingsAction(params)),
});

const propTypes = {
    webServerAddress: PropTypes.string.isRequired,
    apiServerAddress: PropTypes.string.isRequired,
    serverlessAddress: PropTypes.string.isRequired,
    setSettings: PropTypes.func.isRequired,
    server: PropTypes.string.isRequired,
};

const defaultProps = {
};

const saveButtonLabel = 'Save';
const serverSelectInputTitle = 'Server';
const serverSelectInputPlaceholder = 'Select a server';
const webServerAddressTitle = 'Web server address';
const webServerAddressInputPlaceholder = 'eg: https://thedeep.io';
const apiServerAddressTitle = 'API server address';
const apiServerAddressInputPlaceholder = 'eg: https://api.thedeep.io';
const serverlessAddressTitle = 'Serverless server address';
const serverlessAddressInputPlaceholder = 'eg: https://services.thedeep.io';
const saveSuccessfulMessage = 'Settings saved successfully';
// const saveFailureMessage = 'Failed to save';

const keySelector = d => d.id;
const labelSelector = d => d.title;

class Settings extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            inputValues: {
                server: props.server,
                webServerAddress: props.webServerAddress,
                apiServerAddress: props.apiServerAddress,
                serverlessAddress: props.serverlessAddress,
            },
            faramErrors: {},
            pristine: true,
        };

        const showLocalhost = process.env.REACT_APP_LOCALHOST_SUPPORT !== 'disable';

        // NOTE: in development mode, http://localhost can also be used as url
        const conditionForUrl = showLocalhost
            ? [requiredCondition]
            : [requiredCondition, urlCondition];

        this.schema = {
            fields: {
                server: [requiredCondition],
                webServerAddress: conditionForUrl,
                apiServerAddress: conditionForUrl,
                serverlessAddress: conditionForUrl,
            },
        };

        this.serverOptions = [
            {
                id: 'beta',
                title: 'Beta',
            },
            {
                id: 'alpha',
                title: 'Alpha',
            },
        ];

        if (showLocalhost) {
            this.serverOptions.push({
                id: 'localhost',
                title: 'Localhost',
            });
        }

        this.serverOptions.push({
            id: 'custom',
            title: 'Custom',
        });

        this.serverAddresses = {
            beta: {
                web: 'https://beta.thedeep.io',
                api: 'https://api.thedeep.io',
                serverless: 'https://services.thedeep.io',
            },
            alpha: {
                web: 'https://alpha.thedeep.io',
                api: 'https://api.alpha.thedeep.io',
                serverless: 'https://services-alpha.thedeep.io',
            },
            localhost: {
                web: 'http://localhost:3000',
                api: 'http://localhost:8000',
                serverless: 'https://services-local.thedeep.io',
            },
            custom: {
                web: 'http://',
                api: 'http://',
                serverless: 'https://',
            },
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            server: newServer,
            webServerAddress: newWebServerAddress,
            apiServerAddress: newApiServerAddress,
            serverlessAddress: newServerlessServerAddress,
        } = nextProps;

        const {
            server: oldServer,
            webServerAddress: oldWebServerAddress,
            apiServerAddress: oldApiServerAddress,
            serverlessAddress: oldServerlessServerAddress,
        } = this.props;

        if (newServer !== oldServer
            || newWebServerAddress !== oldWebServerAddress
            || newApiServerAddress !== oldApiServerAddress
            || newServerlessServerAddress !== oldServerlessServerAddress
        ) {
            this.setState({
                inputValues: {
                    server: newServer,
                    webServerAddress: newWebServerAddress,
                    apiServerAddress: newApiServerAddress,
                    serverlessAddress: newServerlessServerAddress,
                },
                faramErrors: {},
                pristine: true,
            });
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    // STATUS

    removeSaveStatus = () => {
        this.setState({ saveStatus: undefined });
    }

    showSaveStatus = () => {
        this.setState({
            saveStatus: saveSuccessfulMessage,
            pristine: true,
        });

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.removeSaveStatus, 5000);
    }

    // FORM

    handleFormChange = (value, faramErrors) => {
        const newValues = { ...value };
        const { inputValues } = this.state;

        if (value.server !== inputValues.server) {
            const serverAddress = this.serverAddresses[newValues.server];
            newValues.webServerAddress = serverAddress.web;
            newValues.apiServerAddress = serverAddress.api;
            newValues.serverlessAddress = serverAddress.serverless;
        }

        this.setState({
            faramErrors,
            inputValues: newValues,
            pristine: false,
        });
    }

    handleFormFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFormSuccess = (values) => {
        const { setSettings } = this.props;
        console.warn(values);
        setSettings(values);
        this.showSaveStatus();
    }

    render() {
        const {
            inputValues,
            faramErrors,
            saveStatus,
            pristine,
        } = this.state;

        const isCustomInput = inputValues.server === 'custom';

        return (
            <div className={styles.settings}>
                <Faram
                    onValidationSuccess={this.handleFormSuccess}
                    onValidationFailure={this.handleFormFailure}
                    onChange={this.handleFormChange}
                    schema={this.schema}
                    error={faramErrors}
                    value={inputValues}
                >
                    <div className={styles.inputs}>
                        <SegmentInput
                            className={styles.input}
                            label={serverSelectInputTitle}
                            placeholder={serverSelectInputPlaceholder}
                            faramElementName="server"
                            options={this.serverOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="webServerAddress"
                            label={webServerAddressTitle}
                            placeholder={webServerAddressInputPlaceholder}
                            readOnly={!isCustomInput}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="apiServerAddress"
                            label={apiServerAddressTitle}
                            placeholder={apiServerAddressInputPlaceholder}
                            readOnly={!isCustomInput}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="serverlessAddress"
                            label={serverlessAddressTitle}
                            placeholder={serverlessAddressInputPlaceholder}
                            readOnly={!isCustomInput}
                        />
                    </div>
                    <footer className={styles.footer}>
                        <div className={styles.saveStatus}>
                            { saveStatus }
                        </div>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine}
                        >
                            { saveButtonLabel }
                        </PrimaryButton>
                    </footer>
                </Faram>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
