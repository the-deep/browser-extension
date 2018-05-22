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
        this.parent.fillExtraInfo();
    }

    create = (projectId) => {
        this.createDefault({
            url: createUrlForLeadOptions(projectId),
            createParams: createParamsForLeadOptions,
        });
    }
}
