import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isDefined } from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    urlCondition,
} from '@togglecorp/faram';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Icon from '#rscg/Icon';
import DateInput from '#rsci/DateInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
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
    currentUserId: PropTypes.number,
    webServerAddress: PropTypes.string.isRequired,
    requests: PropTypes.shape({
        webInfoRequest: PropTypes.object.isRequired,
        leadOptionsRequest: PropTypes.object.isRequired,
        projectsListRequest: PropTypes.object.isRequired,
        leadCreateRequest: PropTypes.object.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setProjectList: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setLeadOptions: PropTypes.func.isRequired,
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

const requests = {
    webInfoRequest: {
        url: '/web-info-extract/',
        body: ({ props: { currentTabId } }) => ({ url: currentTabId }),
        method: methods.POST,
        onPropsChanged: ['currentTabId'],
        onMount: ({ props: { currentTabId } }) => currentTabId && currentTabId.length > 0,
        schemaName: 'webInfo',
        onSuccess: ({ params, response }) => {
            params.fillWebInfo(response);
        },
    },
    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.GET,
        schemaName: 'leadOptions',
        query: ({ props: { inputValues } }) => ({
            project: inputValues.project,
            fields: [
                'assignee',
                'confidentiality',
            ],
        }),
        onPropsChanged: {
            inputValues: ({
                props: { inputValues = {} },
                prevProps: { inputValues: prevInputValues = {} },
            }) => (
                inputValues.project !== prevInputValues.project
                && inputValues.project
                && inputValues.project.length > 0
            ),
        },
        onMount: ({
            props: {
                inputValues: { project } = {},
            },
        }) => project && project.length > 0,
        onSuccess: ({ props, params, response }) => {
            props.setLeadOptions({ leadOptions: response });
            params.fillExtraInfo();
        },
    },
    projectsListRequest: {
        url: '/projects/member-of/',
        schemaName: 'projectsList',
        query: {
            fields: [
                'id',
                'title',
            ],
        },
        method: methods.GET,
        onMount: true,
        onSuccess: ({ props, response }) => {
            props.setProjectList({ projects: response.results });
        },
    },
    leadCreateRequest: {
        url: '/leads/',
        method: methods.POST,
        body: ({ params }) => ({
            ...params.values,
            sourceType: 'website',
        }),
        schemaName: 'array.lead',
        /*
         * Commented out because this would save only id and project
        query: {
            fields: [
                'id',
                'project',
            ],
        },
        */
        onSuccess: ({
            props: { currentTabId },
            params,
            response,
        }) => {
            let submittedLeadId;
            let submittedProjectId;

            if (response.length === 1) {
                submittedLeadId = response[0].id;
                submittedProjectId = response[0].project;
            }

            params.handleLeadCreationSuccess({
                submittedLeadId,
                submittedProjectId,
                leadSubmittedSuccessfully: true,
                errorDescription: undefined,
                tabId: currentTabId,
            });
        },
        onFailure: ({ params, error }) => {
            params.handleLeadCreationFailure(error.faramErrors);
        },
        onFatal: ({ params }) => {
            params.handleLeadCreationFatal();
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

        webInfoRequest.setDefaultParams({ fillWebInfo: this.fillWebInfo });
        leadOptionsRequest.setDefaultParams({ fillExtraInfo: this.fillExtraInfo });

        this.state = {
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
    }

    componentWillMount() {
        const {
            inputValues: { project },
            setLeadOptions,
        } = this.props;

        const moreThanOneProject = project && project.length > 0;
        if (!moreThanOneProject) {
            setLeadOptions({ leadOptions: emptyObject });
        }
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

        // FIXME: use isDefined and isNotDefined
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
        const {
            requests: {
                leadCreateRequest,
            },
        } = this.props;

        leadCreateRequest.do({
            values,
            handleLeadCreationFailure: this.handleLeadCreationFailure,
            handleLeadCreationSuccess: this.handleLeadCreationSuccess,
            handleLeadCreationFatal: this.handleLeadCreationFatal,
        });
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

    handleLeadCreationSuccess = ({
        submittedLeadId,
        submittedProjectId,
        leadSubmittedSuccessfully,
        errorDescription,
        tabId,
    }) => {
        const { clearInputValue } = this.props;
        this.setState({
            submittedLeadId,
            submittedProjectId,
            leadSubmittedSuccessfully,
            errorDescription,
        });
        clearInputValue(tabId);
    }

    handleLeadCreationFailure = (faramErrors) => {
        const {
            $internal,
            message,
            ...fieldErrors
        } = faramErrors;

        if (Object.keys(fieldErrors).length > 0) {
            this.setState({
                submittedLeadId: undefined,
                submittedProjectId: undefined,
                leadSubmittedSuccessfully: undefined,
            });

            this.updateUiState({
                faramErrors,
                pristine: true,
            });
        } else {
            this.setState({
                submittedLeadId: undefined,
                submittedProjectId: undefined,
                leadSubmittedSuccessfully: false,
                errorDescription: message || $internal.join(', '),
            });
        }
    }

    handleLeadCreationFatal = () => {
        this.setState({
            submittedLeadId: undefined,
            submittedProjectId: undefined,
            leadSubmittedSuccessfully: false,
            errorDescription: undefined,
        });
    }

    renderSuccessMessage = () => {
        const {
            submittedLeadId,
            submittedProjectId,
        } = this.state;

        const { webServerAddress } = this.props;
        // TODO: use isDefined
        const canAddEntry = !!submittedProjectId && !!submittedLeadId;
        const targetUrl = `${webServerAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/edit-entries/`;

        return (
            <div className={styles.submitSuccess}>
                <Icon
                    className={styles.icon}
                    name="checkmarkCircle"
                />
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
            <Icon
                className={styles.icon}
                name="closeCircle"
            />
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
                leadOptionsRequest: {
                    pending: pendingLeadOptions,
                },
                projectsListRequest: {
                    pending: pendingProjectList,
                },
                leadCreateRequest: {
                    pending: pendingLeadCreate,
                },
            },
        } = this.props;

        const { faramErrors = emptyObject } = uiState;

        const { leadSubmittedSuccessfully } = this.state;

        const SuccessMessage = this.renderSuccessMessage;
        const FailureMessage = this.renderFailureMessage;

        if (isDefined(leadSubmittedSuccessfully)) {
            return leadSubmittedSuccessfully
                ? <SuccessMessage />
                : <FailureMessage />;
        }

        const disabled = pendingProjectList
            || pendingWebInfo
            || pendingLeadCreate;

        return (
            <div className={styles.addLead}>
                { disabled && <LoadingAnimation /> }
                <Faram
                    className={styles.inputs}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    error={faramErrors}
                    value={inputValues}
                    disabled={disabled}
                >
                    <NonFieldErrors faramElement />
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
                        disabled={pendingLeadOptions || disabled}
                    />
                    <SelectInput
                        faramElementName="assignee"
                        label={assigneeInputLabel}
                        options={assignee}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        renderEmpty={renderEmpty}
                        disabled={pendingLeadOptions || disabled}
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
                            pending={pendingLeadCreate}
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
