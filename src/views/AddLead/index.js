import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DateInput from '../../vendor/react-store/components/Input/DateInput';
import Faram, {
    requiredCondition,
    urlCondition,
} from '../../vendor/react-store/components/Input/Faram';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import WebInfo from './requests/WebInfo';
import LeadOptions from './requests/LeadOptions';
import ProjectList from './requests/ProjectList';
import LeadCreate from './requests/LeadCreate';

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
} from '../../redux';

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

@connect(mapStateToProps, mapDispatchToProps)
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectList: false,
            pendingLeadOptions: false,
            pendingWebInfo: false,
            pendingLeadCreate: false,

            leadSubmittedSuccessfully: undefined,
            submittedLeadId: undefined,
            submittedProjectId: undefined,
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

        this.webInfo = new WebInfo({
            setState,
            fillWebInfo: this.fillWebInfo,
        });

        this.leadOptions = new LeadOptions({
            setState,
            setLeadOptions: this.props.setLeadOptions,
            fillExtraInfo: this.fillExtraInfo,
        });

        this.projectList = new ProjectList({
            setState,
            setProjectList: this.props.setProjectList,
        });

        this.leadCreate = new LeadCreate({
            setState,
            clearInputValue: this.props.clearInputValue,
        });
    }

    componentWillMount() {
        this.projectList.create();
        this.projectList.request.start();

        // NOTE: load leadoptions just in case
        this.requestForLeadOptions(this.props.inputValues.project);
        this.requestForWebInfo(this.props.currentTabId);
    }

    componentWillReceiveProps(nextProps) {
        const { inputValues: oldInputValues } = this.props;
        const { inputValues: newInputValues } = nextProps;

        if (oldInputValues !== newInputValues) {
            if (oldInputValues.project !== newInputValues.project) {
                this.requestForLeadOptions(newInputValues.project);
            }
        }

        if (this.props.currentTabId !== nextProps.currentTabId) {
            this.requestForWebInfo(nextProps.currentTabId);
        }
    }

    componentWillUnmount() {
        this.projectList.request.stop();
        this.leadOptions.request.stop();
        this.webInfo.request.stop();
        this.leadCreate.request.stop();
    }

    requestForWebInfo = (url) => {
        this.webInfo.request.stop();

        if (url && url.length > 0) {
            this.webInfo.create(url);
            this.webInfo.request.start();
        }
    }

    requestForLeadOptions = (project) => {
        this.leadOptions.request.stop();

        if (!project || project.length <= 0) {
            const { setLeadOptions } = this.props;
            setLeadOptions({ leadOptions: emptyObject });
            return;
        }

        this.leadOptions.create(project);
        this.leadOptions.request.start();
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
        if (!inputValues.assignee || (inputValues.assignee || []).length === 0) {
            values.assignee = [currentUserId];
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
        const targetUrl = `${webServerAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/edit-entries/`;

        return (
            <div className={styles.submitSuccess}>
                <div className={`${styles.icon} ${checkmarkIcon}`} />
                <div className={styles.message}>
                    { leadSubmitSuccessMessage }
                </div>
                <a
                    target="_blank"
                    className={styles.addEntryLink}
                    href={targetUrl}
                >
                    { addEntryButtonTitle }
                </a>
            </div>
        );
    }

    renderFailureMessage = () => (
        <div className={styles.submitFailure}>
            <div className={`${styles.icon} ${closeIcon}`} />
            <div className={styles.message}>
                { leadSubmitFailureMessage }
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
        } = this.props;
        const { faramErrors = emptyObject } = uiState;
        const {
            pendingProjectList,
            pendingLeadOptions,
            pendingWebInfo,
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
                    <MultiSelectInput
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
