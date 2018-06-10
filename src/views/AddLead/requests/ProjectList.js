import Request from '../../../utils/Request';

import {
    createUrlForProjectList,
    createParamsForProjectList,
} from '../../../rest/project';

export default class ProjectList extends Request {
    handlePreLoad = () => { this.parent.setState({ pendingProjectList: true }); }
    handlePostLoad = () => { this.parent.setState({ pendingProjectList: false }); }

    handleSuccess = (response) => {
        const params = { projects: response.results };
        this.parent.setProjectList(params);
    }

    create = () => {
        this.createDefault({
            url: createUrlForProjectList(),
            createParams: createParamsForProjectList,
        });
    }
}
