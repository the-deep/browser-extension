import Request from '../../../utils/Request.js';

import {
    createUrlForWebInfo,
    createParamsForWebInfo,
} from '../../../rest/web.js';

export default class WebInfo extends Request {
    handlePreLoad = () => { this.parent.setState({ pendingWebInfo: true }); }
    handlePostLoad = () => { this.parent.setState({ pendingWebInfo: false }); }
    handleSuccess = (response) => { this.parent.fillWebInfo(response); }

    create = (url) => {
        super.create({
            url: createUrlForWebInfo,
            createParams: createParamsForWebInfo,
            params: { url },
        });
    }
}
