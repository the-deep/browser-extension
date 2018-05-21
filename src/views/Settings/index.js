import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import Faram, {
    requiredCondition,
    urlCondition,
} from '../../vendor/react-store/components/Input/Faram';

import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    setSettingsAction,
    webServerAddressSelector,
    apiServerAddressSelector,
    serverSelector,
} from '../../redux';

import styles from './styles.scss';

const mapStateToProps = state => ({
    webServerAddress: webServerAddressSelector(state),
    apiServerAddress: apiServerAddressSelector(state),
    server: serverSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSettings: params => dispatch(setSettingsAction(params)),
});

const propTypes = {
    webServerAddress: PropTypes.string.isRequired,
    apiServerAddress: PropTypes.string.isRequired,
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

@connect(mapStateToProps, mapDispatchToProps)
export default class Settings extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        console.warn('constructor', props);
        this.state = {
            inputValues: {
                server: props.server,
                webServerAddress: props.webServerAddress,
                apiServerAddress: props.apiServerAddress,
            },
            faramErrors: {},
        };

        this.schema = {
            fields: {
                server: [requiredCondition],
                webServerAddress: [requiredCondition, urlCondition],
                apiServerAddress: [requiredCondition, urlCondition],
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
            {
                id: 'custom',
                title: 'Custom',
            },
        ];

        this.serverAddresses = {
            beta: {
                web: 'https://beta.thedeep.io',
                api: 'https://api.thedeep.io',
            },
            alpha: {
                web: 'https://deeper.togglecorp.com',
                api: 'https://api.deeper.togglecorp.com',
            },
            custom: {
                web: '',
                api: '',
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        console.warn('cwrp', nextProps);

        const {
            server: newServer,
            webServerAddress: newWebServerAddress,
            apiServerAddress: newApiServerAddress,
        } = nextProps;

        const {
            server: oldServer,
            webServerAddress: oldWebServerAddress,
            apiServerAddress: oldApiServerAddress,
        } = this.props;

        if (newServer !== oldServer
            || newWebServerAddress !== oldWebServerAddress
            || newApiServerAddress !== oldApiServerAddress
        ) {
            this.setState({
                inputValues: {
                    server: nextProps.server,
                    webServerAddress: nextProps.webServerAddress,
                    apiServerAddress: nextProps.apiServerAddress,
                },
                faramErrors: {},
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
        this.setState({ saveStatus: 'Successfully saved' });

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.removeSaveStatus, 5000);
    }

    // FORM

    handleFormChange = (value, faramErrors) => {
        const newValues = { ...value };

        const serverAddress = this.serverAddresses[newValues.server];
        newValues.webServerAddress = serverAddress.web;
        newValues.apiServerAddress = serverAddress.api;

        this.setState({
            faramErrors,
            inputValues: newValues,
        });
    }

    handleFormFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFormSuccess = (values) => {
        const { setSettings } = this.props;
        setSettings(values);
        this.showSaveStatus();
    }

    render() {
        const {
            inputValues,
            faramErrors,
            saveStatus,
        } = this.state;

        const isCustomInput = inputValues.server === 'custom';

        return (
            <div className={styles.settings}>
                <Faram
                    onValidationSuccess={this.handleFormSuccess}
                    onValidationFail={this.handleFormFailure}
                    onChange={this.handleFormChange}
                    schema={this.schema}
                    error={faramErrors}
                    value={inputValues}
                >
                    <div className={styles.inputs}>
                        <SelectInput
                            className={styles.input}
                            label={serverSelectInputTitle}
                            placeholder={serverSelectInputPlaceholder}
                            faramElementName="server"
                            options={this.serverOptions}
                            hideClearButton
                            keySelector={d => d.id}
                            labelSelector={d => d.title}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="webServerAddress"
                            label={webServerAddressTitle}
                            placeholder={webServerAddressInputPlaceholder}
                            disabled={!isCustomInput}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="apiServerAddress"
                            label={apiServerAddressTitle}
                            placeholder={apiServerAddressInputPlaceholder}
                            disabled={!isCustomInput}
                        />
                    </div>
                    <footer className={styles.footer}>
                        <div className={styles.saveStatus}>
                            { saveStatus }
                        </div>
                        <PrimaryButton type="submit">
                            { saveButtonLabel }
                        </PrimaryButton>
                    </footer>
                </Faram>
            </div>
        );
    }
}
