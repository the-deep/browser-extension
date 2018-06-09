import Request from '../../../utils/Request.js';
import { alterResponseErrorToFaramError } from '../../../utils/faram.js';

import {
    createUrlForLeadCreate,
    createParamsForLeadCreate,
} from '../../../rest/lead.js';

export default class LeadCreate extends Request {
    handlePreLoad = () => { this.parent.setState({ pendingLeadCreate: true }); }

    handleSuccess = (response) => {
        let submittedLeadId;
        let submittedProjectId;

        if (response.length === 1) {
            submittedLeadId = response[0].id;
            submittedProjectId = response[0].project;
        }

        const { currentTabId } = this.parent;
        this.parent.setState({
            submittedLeadId,
            submittedProjectId,
            leadSubmittedSuccessfully: true,
            pendingLeadCreate: false,
            errorDescription: undefined,
        });

        this.parent.clearInputValue({
            tabId: currentTabId,
        });
    }

    handleFailure = (response = {}) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);

        const {
            $internal,
            ...fieldErrors
        } = faramErrors;

        if (Object.keys(fieldErrors).length > 0) {
            this.parent.setState({
                submittedLeadId: undefined,
                submittedProjectId: undefined,
                leadSubmittedSuccessfully: undefined,
                pendingLeadCreate: false,
            });

            this.parent.updateUiState({
                faramErrors,
                pristine: true,
            });
        } else {
            this.parent.setState({
                submittedLeadId: undefined,
                submittedProjectId: undefined,
                leadSubmittedSuccessfully: false,
                pendingLeadCreate: false,
                errorDescription: $internal.join(', '),
            });
        }
    }

    handleFatal = () => {
        this.parent.setState({
            submittedLeadId: undefined,
            submittedProjectId: undefined,
            leadSubmittedSuccessfully: false,
            pendingLeadCreate: false,
            errorDescription: undefined,
        });
    }

    create = (values) => {
        this.createDefault({
            url: createUrlForLeadCreate(),
            createParams: createParamsForLeadCreate,
            params: {
                ...values,
                sourceType: 'website',
            },
        });
    }
}
