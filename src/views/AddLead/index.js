import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import DateInput from '#rsci/DateInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    RequestCoordinator,
    createRequestClient,
    methods,
} from '#request';

import {
    updateInputValuesAction,
    clearInputValueAction,
    setProjectListAction,
    inputValuesForTabSelector,
    uiStateForTabSelector,
    currentTabIdSelector,
    currentUserIdSelector,
    projectListSelector,
    setLeadOptionsAction,
    leadOptionsSelector,
    webServerAddressSelector,
} from '#redux';

import LeadOptions from './requests/LeadOptions';
import ProjectList from './requests/ProjectList';
import LeadCreate from './requests/LeadCreate';

import styles from './styles.scss';

const emptyObject = {};

const keySelector = d => (d || {}).key;
const labelSelector = d => (d || {}).value;
const projectKeySelector = d => (d || {}).id;
const projectLabelSelector = d => (d || {}).title;

const mapStateToProps = state => ({
    uiState: uiStateForTabSelector(state),
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
    projects: projectListSelector(state),
    leadOptions: leadOptionsSelector(state),
    currentUserId: currentUserIdSelector(state),
    webServerAddress: webServerAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValues: params => dispatch(updateInputValuesAction(params)),
    clearInputValue: params => dispatch(clearInputValueAction(params)),
    setProjectList: params => dispatch(setProjectListAction(params)),
    setLeadOptions: params => dispatch(setLeadOptionsAction(params)),
});

const propTypes = {
    uiState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    inputValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentTabId: PropTypes.string.isRequired,
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    leadOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types,
    updateInputValues: PropTypes.func.isRequired,
    clearInputValue: PropTypes.func.isRequired,
    setProjectList: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setLeadOptions: PropTypes.func.isRequired,
    currentUserId: PropTypes.number,
    webServerAddress: PropTypes.string.isRequired,
};

const defaultProps = {
    currentUserId: undefined,
};

const renderEmpty = () => 'Select a project for available option(s)';
const leadSubmitFailureMessage = 'Failed to save the lead';
const leadSubmitSuccessMessage = 'Lead submitted successfully';
const addEntryButtonTitle = 'Add entry';
const submitButtonTitle = 'submit';
const websiteInputLabel = 'Website';
const urlInputLabel = 'Url';
const publishedOnInputLabel = 'Published on';
const assigneeInputLabel = 'Assignee';
const confidentialityInputLabel = 'Confidentiality';
const sourceInputLabel = 'Publisher';
const titleInputLabel = 'Title';
const projectInputLabel = 'Project';

const checkmarkIcon = 'ion-ios-checkmark-outline';
const closeIcon = 'ion-ios-close-outline';

const requests = {
    webInfoRequest: {
        url: '/web-info-extract/',
        body: ({ props: { currentTabId } }) => ({ url: currentTabId }),
        method: methods.POST,
        onPropsChanged: ['currentTabId'],
        onMount: ({ props: { currentTabId } }) => currentTabId && currentTabId.length > 0,
        onSuccess: ({ params, response }) => {
            params.fillWebInfo(response);
        },
    },
    leadOptionsRequest: {
        url: ({ props: { inputValues } }) => `/lead-options/?project=${inputValues.project}`,
        method: methods.GET,
        onPropsChanged: {
            inputValues: ({
                props: { inputValues = {} },
                prevProps: { inputValues: prevInputValues = {} },
            }) => (
                inputValues.project !== prevInputValues.project
            ),
        },
        onMount: ({
            props: {
                inputValues: { project } = {},
                setLeadOptions,
            },
        }) => {
            if (!project || project.length <= 0) {
                setLeadOptions({ leadOptions: emptyObject });
                return false;
            }
            return true;
        },
        onSuccess: ({ props, params, response }) => {
            props.setLeadOptions({ leadOptions: response });
            params.fillExtraInfo();
        },
    },
};

class AddLead extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                webInfoRequest,
                leadOptionsRequest,
            },
        } = this.props;

        webInfoRequest.setDefaultParams({
            fillWebInfo: this.fillWebInfo,
        });

        leadOptionsRequest.setDefaultParams({
            fillExtraInfo: this.fillExtraInfo,
        });

        this.state = {
            pendingProjectList: false,
            pendingLeadCreate: false,

            leadSubmittedSuccessfully: undefined,
            submittedLeadId: undefined,
            submittedProjectId: undefined,
            errorDescription: undefined,
        };

        this.schema = {
            fields: {
                project: [requiredCondition],
                title: [requiredCondition],
                source: [requiredCondition],
                confidentiality: [requiredCondition],
                assignee: [requiredCondition],
                publishedOn: [requiredCondition],
                url: [
                    requiredCondition,
                    urlCondition,
                ],
                website: [requiredCondition],
            },
        };

        const setState = d => this.setState(d);

        this.projectList = new ProjectList({
            setState,
            setProjectList: this.props.setProjectList,
        });

        this.leadCreate = new LeadCreate({
            setState,
            clearInputValue: this.props.clearInputValue,
            updateUiState: this.updateUiState,
        });
    }

    componentWillUnmount() {
        this.projectList.request.stop();
        this.leadCreate.request.stop();
    }

    fillExtraInfo = () => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
            currentUserId,
            leadOptions = emptyObject,
            uiState,
        } = this.props;

        const values = {};
        if (!inputValues.assignee) {
            values.assignee = currentUserId;
        }
        if (!inputValues.confidentiality) {
            values.confidentiality = ((leadOptions.confidentiality || [])[0] || {}).key;
        }

        const newValues = {
            ...inputValues,
            ...values,
        };

        const newUiState = {
            ...uiState,
            pristine: false,
        };

        updateInputValues({
            tabId: currentTabId,
            values: newValues,
            uiState: newUiState,
        });
    }

    fillWebInfo = (webInfo) => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
            uiState,
        } = this.props;

        const values = {};
        if (webInfo.project && (!inputValues.project || inputValues.project.length === 0)) {
            values.project = [webInfo.project];
        }

        if (webInfo.date && !inputValues.date) {
            values.publishedOn = webInfo.date;
        }
        if (webInfo.source && !inputValues.source) {
            values.source = webInfo.source;
        }
        if (webInfo.website && !inputValues.website) {
            values.website = webInfo.website;
        }
        if (webInfo.title && !inputValues.title) {
            values.title = webInfo.title;
        }
        if (webInfo.url && !inputValues.url) {
            values.url = webInfo.url;
        }

        const newValues = {
            ...inputValues,
            ...values,
        };

        const newUiState = {
            ...uiState,
            pristine: false,
        };

        updateInputValues({
            tabId: currentTabId,
            values: newValues,
            newUiState,
        });
    }

    updateUiState = (uiState) => {
        const {
            currentTabId,
            updateInputValues,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values: {},
            uiState,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        const {
            currentTabId,
            updateInputValues,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values: {},
            uiState: {
                faramErrors,
                pristine: true,
            },
        });
    }

    handleFaramValidationSuccess = (values) => {
        this.leadCreate.request.stop();
        this.leadCreate.create(values);
        this.leadCreate.request.start();
    }

    handleFaramChange = (values, faramErrors) => {
        const uiState = {
            faramErrors,
            pristine: true,
        };

        const {
            updateInputValues,
            currentTabId,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            uiState,
            values,
        });
    }

    renderSuccessMessage = () => {
        const {
            submittedLeadId,
            submittedProjectId,
        } = this.state;

        const { webServerAddress } = this.props;
        const canAddEntry = !!(submittedProjectId && submittedLeadId);
        const targetUrl = `${webServerAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/edit-entries/`;

        return (
            <div className={styles.submitSuccess}>
                <div className={`${styles.icon} ${checkmarkIcon}`} />
                <div className={styles.message}>
                    { leadSubmitSuccessMessage }
                </div>
                {canAddEntry && (
                    <a
                        target="_blank"
                        className={styles.addEntryLink}
                        href={targetUrl}
                    >
                        { addEntryButtonTitle }
                    </a>
                )}
            </div>
        );
    }

    renderFailureMessage = () => (
        <div className={styles.submitFailure}>
            <div className={`${styles.icon} ${closeIcon}`} />
            <div className={styles.message}>
                { leadSubmitFailureMessage }
            </div>
            <div className={styles.description}>
                { this.state.errorDescription }
            </div>
        </div>
    )

    render() {
        const {
            inputValues,
            uiState,
            projects,
            leadOptions: {
                assignee = [],
                confidentiality = [],
            },
            requests: {
                webInfoRequest: {
                    pending: pendingWebInfo,
                },
            },
        } = this.props;
        const { faramErrors = emptyObject } = uiState;
        const {
            pendingProjectList,
            pendingLeadOptions,
            pendingLeadCreate,
            leadSubmittedSuccessfully,
        } = this.state;

        const SuccessMessage = this.renderSuccessMessage;
        const FailureMessage = this.renderFailureMessage;

        if (leadSubmittedSuccessfully === true) {
            return <SuccessMessage />;
        }

        if (leadSubmittedSuccessfully === false) {
            return <FailureMessage />;
        }

        const pending = pendingProjectList
            || pendingLeadOptions
            || pendingWebInfo
            || pendingLeadCreate;

        return (
            <div className={styles.addLead}>
                { pending && <LoadingAnimation /> }
                <Faram
                    className={styles.inputs}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    error={faramErrors}
                    value={inputValues}
                    pending={pending}
                >
                    <MultiSelectInput
                        faramElementName="project"
                        label={projectInputLabel}
                        options={projects}
                        keySelector={projectKeySelector}
                        labelSelector={projectLabelSelector}
                    />
                    <TextInput
                        faramElementName="title"
                        label={titleInputLabel}
                    />
                    <TextInput
                        faramElementName="source"
                        label={sourceInputLabel}
                    />
                    <SelectInput
                        faramElementName="confidentiality"
                        label={confidentialityInputLabel}
                        options={confidentiality}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        renderEmpty={renderEmpty}
                    />
                    <SelectInput
                        faramElementName="assignee"
                        label={assigneeInputLabel}
                        options={assignee}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        renderEmpty={renderEmpty}
                    />
                    <DateInput
                        faramElementName="publishedOn"
                        label={publishedOnInputLabel}
                    />
                    <TextInput
                        faramElementName="url"
                        label={urlInputLabel}
                    />
                    <TextInput
                        faramElementName="website"
                        label={websiteInputLabel}
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            type="submit"
                            disabled={pending}
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
    connect(mapStateToProps, mapDispatchToProps),
    RequestCoordinator,
    createRequestClient(requests),
)(AddLead);
