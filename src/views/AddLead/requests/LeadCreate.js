import Request from '../../../utils/Request.js';

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
        });

        this.parent.clearInputValue({
            tabId: currentTabId,
        });
    }

    handleFailure = () => {
        this.parent.setState({
            submittedLeadId: undefined,
            submittedProjectId: undefined,
            leadSubmittedSuccessfully: false,
            pendingLeadCreate: false,
        });
    }

    handleFatal = () => {
        this.parent.setState({
            submittedLeadId: undefined,
            submittedProjectId: undefined,
            leadSubmittedSuccessfully: false,
            pendingLeadCreate: false,
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
