import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import Faram, {
    requiredCondition,
    urlCondition,
} from '../../vendor/react-store/components/Input/Faram';

import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    setSettingsAction,
    serverAddressSelector,
    apiAddressSelector,
} from '../../redux';

import styles from './styles.scss';

const mapStateToProps = state => ({
    serverAddress: serverAddressSelector(state),
    apiAddress: apiAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSettings: params => dispatch(setSettingsAction(params)),
});

const propTypes = {
    serverAddress: PropTypes.string.isRequired,
    apiAddress: PropTypes.string.isRequired,
    onBackButtonClick: PropTypes.func.isRequired,
    setSettings: PropTypes.func.isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Settings extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            inputValues: {
                serverAddress: props.serverAddress,
                apiAddress: props.apiAddress,
            },
            faramErrors: {},
        };

        this.schema = {
            fields: {
                serverAddress: [requiredCondition, urlCondition],
                apiAddress: [requiredCondition, urlCondition],
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        // FIXME: add checks
        this.setState({
            inputValues: {
                serverAddress: nextProps.serverAddress,
                apiAddress: nextProps.apiAddress,
            },
            faramErrors: {},
        });
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
        this.setState({
            faramErrors,
            inputValues: value,
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
        const { onBackButtonClick } = this.props;
        const {
            inputValues,
            faramErrors,
            saveStatus,
        } = this.state;

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
                    <header className={styles.header}>
                        <h1>
                            Settings
                        </h1>
                        <AccentButton
                            transparent
                            onClick={onBackButtonClick}
                        >
                            Back
                        </AccentButton>
                    </header>
                    <div className={styles.content}>
                        <TextInput
                            faramElementName="serverAddress"
                            label="Server address"
                            placeholder="eg: https://thedeep.io"
                        />
                        <TextInput
                            faramElementName="apiAddress"
                            label="Api address"
                            placeholder="eg: https://api.thedeep.io"
                        />
                    </div>
                    <footer className={styles.footer}>
                        <div className={styles.saveStatus}>
                            { saveStatus }
                        </div>
                        <PrimaryButton type="submit">
                            Save
                        </PrimaryButton>
                    </footer>
                </Faram>
            </div>
        );
    }
}
