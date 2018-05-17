import { FgRestBuilder } from '../vendor/react-store/utils/rest';

const requestNotCreatedMessage = 'Request -> start() called before it was created';

export default class Request {
    constructor(parent) {
        this.parent = parent;
        this.request = {
            start: () => { console.warn(requestNotCreatedMessage); },
            stop: () => { console.warn(requestNotCreatedMessage); },
        };
        this.createParams = {};
    }

    create = (createOptions) => {
        this.createOptions = createOptions;

        const {
            url,
            createParams,
            params,
        } = createOptions;

        const request = new FgRestBuilder()
            .url(url)
            .params(() => createParams(params))
            .preLoad(this.handlePreLoad)
            .success(this.handleSuccess)
            .failure(this.handleFailure)
            .fatal(this.handleFatal)
            .abort(this.handleAbort)
            .build();

        this.request = request;
    }
}
