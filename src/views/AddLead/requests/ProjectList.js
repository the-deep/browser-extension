import Request from '../../../utils/Request.js';

import {
    createUrlForProjectList,
    createParamsForProjectList,
} from '../../../rest/lead.js';

export default class ProjectList extends Request {
    handlePreLoad = () => { this.parent.setState({ pendingProjectList: true }); }
    handlePostLoad = () => { this.parent.setState({ pendingProjectList: false }); }

    handleSuccess = (response) => {
        const params = { projects: response.results };
        this.parent.setProjectList(params);
    }

    create = (projectId) => {
        super.create({
            url: createUrlForProjectList(projectId),
            createParams: createParamsForProjectList,
        });
    }
}
