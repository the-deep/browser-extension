import Request from '../../../utils/Request.js';

import {
    createUrlForLeadOptions,
    createParamsForLeadOptions,
} from '../../../rest/lead.js';

export default class LeadOptions extends Request {
    handlePreLoad = () => { this.parent.setState({ pendingLeadOptions: true }); }
    handlePostLoad = () => { this.parent.setState({ pendingLeadOptions: false }); }
    handleAbort = () => { this.parent.setState({ pendingLeadOptions: false }); }

    handleSuccess = (response) => {
        this.parent.setLeadOptions({ leadOptions: response });
    }


    create = (projectId) => {
        super.create({
            url: createUrlForLeadOptions(projectId),
            createParams: createParamsForLeadOptions,
        });
    }
}