import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';
import titleCase from 'title';

import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsyString,
    isDefined,
    unique,
} from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    urlCondition,
    FaramInputElement,
} from '@togglecorp/faram';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DateInput from '#rsci/DateInput';
import AccentButton from '#rsca/Button/AccentButton';
import MultiSelectInput from '#rsci/MultiSelectInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import BasicSelectInput from '#rsu/../v2/Input/BasicSelectInput';

import {
    RequestCoordinator,
    createRequestClient,
} from '#request';

import {
    updateInputValuesAction,
    clearInputValueAction,
    inputValuesForTabSelector,
    currentTabIdSelector,
    currentUserIdSelector,
    webServerAddressSelector,
} from '#redux';

import SuccessMessage from './SuccessMessage';
import BadgeInput from './BadgeInput';
import {
    fillExtraInfo,
    fillWebInfo,
    fillOrganization,
    capitalizeOnlyFirstLetter,
    trimFileExtension,
    getTitleFromUrl,
} from './utils';
import requests from './requests';
import styles from './styles.scss';

const FaramBasicSelectInput = FaramInputElement(BasicSelectInput);

const submitButtonTitle = 'submit';
const websiteInputLabel = 'Website';
const urlInputLabel = 'Url';
const publishedOnInputLabel = 'Published on';
const assigneeInputLabel = 'Assignee';
const confidentialityInputLabel = 'Confidentiality';
const sourceInputLabel = 'Publishing Organization';
const authorInputLabel = 'Authoring Organization';
const titleInputLabel = 'Title';
const projectInputLabel = 'Project';
const sameAsPublisherButtonTitle = 'Same as publishing organization';

const propTypes = {
    className: PropTypes.string,
    inputValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentTabId: PropTypes.string.isRequired,
    updateInputValues: PropTypes.func.isRequired,
    clearInputValue: PropTypes.func.isRequired,
    currentUserId: PropTypes.number,
    requests: PropTypes.shape({
        webInfoRequest: PropTypes.object.isRequired,
        webInfoDataRequest: PropTypes.object.isRequired,
        leadOptionsRequest: PropTypes.object.isRequired,
        projectsListRequest: PropTypes.object.isRequired,
        leadCreateRequest: PropTypes.object.isRequired,
        organizationsRequest: PropTypes.object.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    webServerAddress: PropTypes.string.isRequired,

    goToAddOrganization: PropTypes.func.isRequired,
    setNavState: PropTypes.func.isRequired,
    getNavState: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    currentUserId: undefined,
};

const mapStateToProps = state => ({
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
    currentUserId: currentUserIdSelector(state),
    webServerAddress: webServerAddressSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValues: params => dispatch(updateInputValuesAction(params)),
    clearInputValue: params => dispatch(clearInputValueAction(params)),
});

function mergeLists(foo, bar) {
    return unique(
        [
            ...foo,
            ...bar,
        ],
        item => item.id,
    );
}

const memberKeySelector = d => d.id;
const memberLabelSelector = d => d.displayName;
const confidentialityKeySelector = d => d.key;
const confidentialityLabelSelector = d => d.value;
const projectKeySelector = d => d.id;
const projectLabelSelector = d => d.title;
const organizationKeySelector = d => d.id;
const organizationLabelSelector = (d) => {
    if (d.mergedAs) {
        return d.mergedAs.title;
    }
    return d.title;
};

class AddLead extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                webInfoDataRequest,
                leadOptionsRequest,
            },
            currentTabId,
        } = this.props;

        this.state = {
            leadSubmitted: false,
            targetUrl: undefined,
            formatTitleAsTitleCase: true,
            suggestedTitleFromUrl: getTitleFromUrl(currentTabId),
            suggestedTitleFromExtraction: undefined,

            searchedOrganizations: [],
            // Organizations filled by web-info-extract and lead-options
            organizations: [],

            faramErrors: {},
        };

        this.schema = {
            fields: {
                project: [requiredCondition],
                title: [requiredCondition],
                source: [requiredCondition],
                author: [],
                confidentiality: [requiredCondition],
                assignee: [requiredCondition],
                publishedOn: [requiredCondition],
                url: [requiredCondition, urlCondition],
                website: [requiredCondition],
            },
        };

        webInfoDataRequest.setDefaultParams({
            handleWebInfoFill: this.handleWebInfoFill,
        });
        leadOptionsRequest.setDefaultParams({
            handleExtraInfoFill: this.handleExtraInfoFill,
        });
    }

    componentDidMount() {
        const {
            getNavState,
            updateInputValues,
            currentTabId,
            inputValues,
        } = this.props;
        const navState = getNavState();
        if (navState) {
            const {
                data: {
                    organization,
                    organizationField,
                },
            } = navState;

            updateInputValues({
                tabId: currentTabId,
                values: fillOrganization(inputValues, organizationField, organization),
            });

            this.setState(state => ({
                organizations: mergeLists(state.organizations, [organization]),
            }));
        }
    }

    setSearchedOrganizations = (searchedOrganizations) => {
        this.setState({ searchedOrganizations });
    }

    setOrganizations = (organizations) => {
        this.setState({ organizations });
    }

    handleOrganizationSearchValueChange = (searchText) => {
        const {
            requests: {
                organizationsRequest,
            },
        } = this.props;

        if (isFalsyString(searchText)) {
            organizationsRequest.abort();
            this.setSearchedOrganizations([]);
        } else {
            organizationsRequest.do({
                searchText,
                setSearchedOrganizations: this.setSearchedOrganizations,
            });
        }
    }

    handleAutoFormatTitleButton = () => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
        } = this.props;
        const { formatTitleAsTitleCase } = this.state;

        const newValues = produce(inputValues, (safeValues) => {
            const { title } = inputValues;

            if (isFalsyString(title)) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            safeValues.title = formatTitleAsTitleCase
                ? titleCase(title) : capitalizeOnlyFirstLetter(title);
            // eslint-disable-next-line no-param-reassign
            safeValues.title = trimFileExtension(safeValues.title);
        });
        this.setState({ formatTitleAsTitleCase: !formatTitleAsTitleCase });
        updateInputValues({
            tabId: currentTabId,
            values: newValues,
        });
    }

    handleExtraInfoFill = (leadOptions) => {
        const {
            currentTabId,
            currentUserId,
            inputValues,
            updateInputValues,
        } = this.props;

        const { organizations } = leadOptions;

        if (organizations.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, organizations),
            }));
        }

        updateInputValues({
            tabId: currentTabId,
            values: fillExtraInfo(inputValues, currentUserId, leadOptions),
        });
    }

    handleWebInfoFill = (webInfo) => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
        } = this.props;

        const newOrgs = [];
        if (webInfo.source) {
            newOrgs.push(webInfo.source);
        }
        if (webInfo.author) {
            newOrgs.push(webInfo.author);
        }
        if (newOrgs.length > 0) {
            this.setState(state => ({
                organizations: mergeLists(state.organizations, newOrgs),
            }));
        }
        this.setState({ suggestedTitleFromExtraction: webInfo.title });

        updateInputValues({
            tabId: currentTabId,
            values: fillWebInfo(inputValues, webInfo),
        });
    }

    handleSameAsPublisherButtonClick = () => {
        const {
            currentTabId,
            updateInputValues,
            inputValues,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values: {
                ...inputValues,
                author: inputValues.source,
            },
        });
    }

    handleFaramChange = (values, faramErrors) => {
        const {
            updateInputValues,
            currentTabId,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values,
        });

        this.setState({ faramErrors });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
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

    handleLeadCreationSuccess = ({
        targetUrl,
        tabId,
    }) => {
        const { clearInputValue } = this.props;

        this.setState({
            leadSubmitted: true,
            targetUrl,
        });

        clearInputValue(tabId);
    }

    handleLeadCreationFailure = (faramErrors) => {
        this.setState({
            leadSubmitted: false,
            targetUrl: undefined,
            faramErrors,
        });
    }

    handleLeadCreationFatal = () => {
        this.setState({
            leadSubmitted: false,
            targetUrl: undefined,
            faramErrors: {
                $internal: ['Some error occurred! Please check your internet connectivity.'],
            },
        });
    }

    handleAddPublisherClick = () => {
        const {
            setNavState,
            goToAddOrganization,
        } = this.props;

        setNavState({
            sender: 'addLead',
            receiver: 'addOrganization',
            data: {
                organizationField: 'publisher',
            },
        });
        goToAddOrganization();
    }

    handleAddAuthorClick = () => {
        const {
            setNavState,
            goToAddOrganization,
        } = this.props;

        setNavState({
            sender: 'addLead',
            receiver: 'addOrganization',
            data: {
                organizationField: 'author',
            },
        });
        goToAddOrganization();
    }

    render() {
        const {
            searchedOrganizations,
            organizations,

            leadSubmitted,
            targetUrl,
            faramErrors,

            suggestedTitleFromUrl,
            suggestedTitleFromExtraction,
        } = this.state;

        const {
            inputValues,
            className,
            requests: {
                webInfoRequest: {
                    pending: pendingWebInfo,
                },
                webInfoDataRequest: {
                    pending: pendingWebInfoData,
                    response: {
                        sourceRaw,
                        source,
                        authorRaw,
                        author,
                    } = {},
                },
                projectsListRequest: {
                    pending: pendingProjectList,
                    response: {
                        results: projects,
                    } = {},
                },
                leadOptionsRequest: {
                    pending: pendingLeadOptions,
                    response: {
                        members,
                        confidentiality,
                    } = {},
                },

                organizationsRequest: {
                    pending: pendingSearchedOrganizations,
                },

                leadCreateRequest: {
                    pending: pendingLeadCreate,
                },
            },
        } = this.props;

        if (leadSubmitted) {
            return (
                <SuccessMessage
                    targetUrl={targetUrl}
                />
            );
        }

        const {
            title,
        } = inputValues;

        const isProjectSelected = inputValues.project && inputValues.project.length > 0;

        const pending = pendingProjectList
            || pendingWebInfo
            || pendingWebInfoData
            || pendingLeadCreate;

        const suggestions = unique([suggestedTitleFromUrl, suggestedTitleFromExtraction])
            .filter(isDefined)
            .filter(suggestion => suggestion !== title);

        return (
            <div className={_cs(styles.addLead, className)}>
                { pending && (
                    <LoadingAnimation />
                )}
                <Faram
                    className={styles.inputs}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    error={faramErrors}
                    value={inputValues}
                    disabled={pending}
                >
                    <NonFieldErrors
                        faramElement
                        persistent={false}
                    />
                    <MultiSelectInput
                        faramElementName="project"
                        label={projectInputLabel}
                        options={projects}
                        keySelector={projectKeySelector}
                        labelSelector={projectLabelSelector}
                    />
                    <div className={_cs(styles.inputButtonGroup, styles.titleGroup)}>
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            label={titleInputLabel}
                        />
                        <div className={styles.buttons}>
                            <AccentButton
                                className={styles.smallButton}
                                title="Format"
                                onClick={this.handleAutoFormatTitleButton}
                            >
                                Aa
                            </AccentButton>
                        </div>
                    </div>
                    {suggestions.length > 0 && (
                        <>
                            <h5 className={styles.suggestionLabel}>
                                Title suggestions:
                            </h5>
                            <div className={styles.suggestions}>
                                {suggestions.map(suggestion => (
                                    <BadgeInput
                                        key={suggestion}
                                        className={styles.suggestionBadge}
                                        faramElementName="title"
                                        title={suggestion}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    <div className={styles.inputButtonGroup}>
                        <FaramBasicSelectInput
                            className={styles.input}
                            faramElementName="source"
                            label={sourceInputLabel}
                            options={organizations}
                            keySelector={organizationKeySelector}
                            labelSelector={organizationLabelSelector}
                            disabled={pendingLeadOptions || pending || !isProjectSelected}
                            hint={!source && sourceRaw ? `Suggestion: ${sourceRaw}` : undefined}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={this.setOrganizations}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                        />
                        <div className={styles.buttons}>
                            <Button
                                title="Add Publishing Organization"
                                iconName="addPerson"
                                onClick={this.handleAddPublisherClick}
                                transparent
                            />
                        </div>
                    </div>
                    <div className={styles.inputButtonGroup}>
                        <FaramBasicSelectInput
                            className={styles.input}
                            faramElementName="author"
                            label={authorInputLabel}
                            options={organizations}
                            keySelector={organizationKeySelector}
                            labelSelector={organizationLabelSelector}
                            disabled={pendingLeadOptions || pending || !isProjectSelected}
                            hint={!author && authorRaw ? `Suggestion: ${authorRaw}` : undefined}

                            searchOptions={searchedOrganizations}
                            searchOptionsPending={pendingSearchedOrganizations}
                            onOptionsChange={this.setOrganizations}
                            onSearchValueChange={this.handleOrganizationSearchValueChange}
                        />
                        <div className={styles.buttons}>
                            <Button
                                title={sameAsPublisherButtonTitle}
                                iconName="copy"
                                onClick={this.handleSameAsPublisherButtonClick}
                                transparent
                            />
                            <Button
                                title="Add Authoring Organization"
                                iconName="addPerson"
                                onClick={this.handleAddAuthorClick}
                                transparent
                            />
                        </div>
                    </div>
                    <SelectInput
                        faramElementName="confidentiality"
                        label={confidentialityInputLabel}
                        options={isProjectSelected ? confidentiality : undefined}
                        keySelector={confidentialityKeySelector}
                        labelSelector={confidentialityLabelSelector}
                        disabled={pendingLeadOptions || pending || !isProjectSelected}
                    />
                    <SelectInput
                        faramElementName="assignee"
                        label={assigneeInputLabel}
                        options={isProjectSelected ? members : undefined}
                        keySelector={memberKeySelector}
                        labelSelector={memberLabelSelector}
                        disabled={pendingLeadOptions || pending || !isProjectSelected}
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
                            disabled={pending || pendingLeadOptions}
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
