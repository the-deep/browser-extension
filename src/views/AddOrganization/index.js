import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
// import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

// import { UploadBuilder } from '#rsu/upload';
// import Label from '#rsci/Label';
// import ImageInput from '#rsci/FileInput/ImageInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestCoordinator,
    createRequestClient,
    // getApiEndpoint,
} from '#request';

/*
import {
    tokenSelector,
} from '#redux';
*/

import requests from './requests';
import styles from './styles.scss';

const submitButtonTitle = 'submit';

const propTypes = {
    requests: PropTypes.shape({
        addOrganizationRequest: PropTypes.object.isRequired,
    }).isRequired,
    className: PropTypes.string,
    // token: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
};

/*
const mapStateToProps = state => ({
    token: tokenSelector(state),
});
*/

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
            pendingLogoUpload: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                shortName: [requiredCondition],
                // longName: [requiredCondition],
                url: [urlCondition, requiredCondition],
                organizationType: [],
                // logo: [],
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
        console.warn(organization);
    }

    handleOrganizationCreateFailure = (faramErrors) => {
        this.setState({
            faramErrors,
        });
    }

    handleOrganizationCreateFatal = () => {
        this.setState({
            faramErrors: {
                $internal: ['Some error occurred! Please check your internet connectivity.'],
            },
        });
    }

    /*
    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            console.error('Invalid file selected');
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const file = files[0];

        if (this.logoUploader) {
            this.logoUploader.stop();
        }
        // createParamsForFileUpload({ is_public: true });
        this.logoUploader = new UploadBuilder()
            .file(file)
            .url(() => `${getApiEndpoint()}/files/`)
            .params(() => {
                const {
                    token: { access },
                } = this.props;
                return {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json; charset=utf-8',
                        Authorization: access ? `Bearer ${access}` : undefined,
                    },
                    body: {
                        is_public: true, // eslint-disable-line @typescript-eslint/camelcase
                    },
                };
            })
            .preLoad(() => this.setState({ pendingLogoUpload: true }))
            .postLoad(() => this.setState({ pendingLogoUpload: false }))
            .success((response) => {
                this.setState(state => ({
                    faramValues: {
                        ...state.faramValues,
                        logo: response.id,
                    },
                }));
            })
            .failure((response) => {
                console.error(response);
            })
            .fatal((response) => {
                console.error(response);
            })
            .build();

        this.logoUploader.start();
    }
    */

    render() {
        const {
            requests: {
                addOrganizationRequest: {
                    pending: pendingAddOrganizationRequest,
                },
            },
            className,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            pendingLogoUpload,
        } = this.state;

        const organizationTypeList = [];

        const disabled = pendingLogoUpload || pendingAddOrganizationRequest;

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
    // connect(mapStateToProps),
    RequestCoordinator,
    createRequestClient(requests),
)(AddOrganization);
