import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import { _cs } from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestCoordinator,
    createRequestClient,
} from '#request';

import SuccessMessage from './SuccessMessage';
import requests from './requests';
import styles from './styles.scss';

const submitButtonTitle = 'submit';

const propTypes = {
    requests: PropTypes.shape({
        addOrganizationRequest: PropTypes.object.isRequired,
        organizationTypesRequest: PropTypes.object.isRequired,
    }).isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

class AddOrganization extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static idSelector = foo => foo.id;

    static titleSelector = foo => foo.title;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pristine: true,

            organizationSubmitted: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                shortName: [requiredCondition],
                // longName: [requiredCondition],
                url: [urlCondition, requiredCondition],
                organizationType: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (values) => {
        // NOTE: adding title as long name
        const newValues = {
            ...values,
            longName: values.title,
        };

        const {
            requests: {
                addOrganizationRequest,
            },
        } = this.props;
        addOrganizationRequest.do({
            body: newValues,
            handleOrganizationCreateSuccess: this.handleOrganizationCreateSuccess,
            handleOrganizationCreateFailure: this.handleOrganizationCreateFailure,
            handleOrganizationCreateFatal: this.handleOrganizationCreateFatal,
        });
    }

    handleOrganizationCreateSuccess = (organization) => {
        // TODO:
        // 1. set this to either publisher or author later
        // 2. add this organization to organization list
        this.setState({
            organizationSubmitted: true,
        });
    }

    handleOrganizationCreateFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            organizationSubmitted: false,
        });
    }

    handleOrganizationCreateFatal = () => {
        this.setState({
            faramErrors: {
                $internal: ['Some error occurred! Please check your internet connectivity.'],
            },
            organizationSubmitted: false,
        });
    }

    render() {
        const {
            requests: {
                addOrganizationRequest: {
                    pending: pendingAddOrganizationRequest,
                },
                organizationTypesRequest: {
                    pending: pendingOrganizationTypesRequset,
                    response: organizationTypesResponse,
                },
            },
            className,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            organizationSubmitted,
        } = this.state;

        if (organizationSubmitted) {
            return (
                <SuccessMessage />
            );
        }

        let organizationTypeList;
        if (organizationTypesResponse) {
            organizationTypeList = organizationTypesResponse.results;
        }

        const disabled = pendingAddOrganizationRequest || pendingOrganizationTypesRequset;

        return (
            <div className={_cs(styles.addOrganization, className)}>
                { pendingAddOrganizationRequest && <LoadingAnimation /> }
                <Faram
                    className={styles.inputs}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pendingAddOrganizationRequest}
                >
                    <NonFieldErrors faramElement />
                    <TextInput
                        faramElementName="title"
                        label="Organization Name"
                        placeholder="eg. People In Need"
                    />
                    <TextInput
                        faramElementName="shortName"
                        label="Abbreviation / Acronym"
                        placeholder="eg. UN OCHA"
                    />
                    <TextInput
                        faramElementName="url"
                        label="URL"
                        placeholder="https://www.unicef.org"
                    />
                    <SelectInput
                        faramElementName="organizationType"
                        label="Organization Type"
                        options={organizationTypeList}
                        keySelector={AddOrganization.idSelector}
                        labelSelector={AddOrganization.titleSelector}
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            type="submit"
                            pending={pendingAddOrganizationRequest}
                            disabled={pristine || disabled}
                        >
                            { submitButtonTitle }
                        </PrimaryButton>
                    </div>
                </Faram>
            </div>
        );
    }
}

export default compose(
    RequestCoordinator,
    createRequestClient(requests),
)(AddOrganization);
