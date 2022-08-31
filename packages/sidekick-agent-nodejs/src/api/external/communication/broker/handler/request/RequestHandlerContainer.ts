import Handler from "../../../../../../handler/Handler";
import { BrokerRequest, RequestName } from "../../../../../../types";
import HandlerContainer from "../../../../../../handler/HandlerContainer";
import PutTracePointMessageHandler from "./tracepoint/PutTracePointRequestHandler";
import EnableTracePointRequestHandler from "./tracepoint/EnableTracePointRequestHandler";
import DisableTracePointRequestHandler from "./tracepoint/DisableTracePointRequestHandler";
import RemoveTracePointRequestHandler from "./tracepoint/RemoveTracePointRequestHandler";
import RemoveBatchTracePointRequestHandler from "./tracepoint/RemoveBatchTracePointRequestHandler";
import UpdateTracePointRequestHandler from "./tracepoint/UpdateTracePointRequestHandler";
import PutLogPointRequestHandler from "./logpoint/PutLogPointRequestHandler";
import EnableLogPointRequestHandler from "./logpoint/EnableLogPointRequestHandler";
import DisableLogPointRequestHandler from "./logpoint/DisableLogPointRequestHandler";
import RemoveLogPointRequestHandler from "./logpoint/RemoveLogPointRequestHandler";
import RemoveBatchLogPointRequestHandler from "./logpoint/RemoveBatchLogPointRequestHandler";
import UpdateLogPointRequestHandler from "./logpoint/UpdateLogPointRequestHandler";
import TracepointManager from "../../../../manager/TracepointManager";
import LogpointManager from "../../../../manager/LogpointManager";

export default class RequestHandlerContainer implements HandlerContainer {
    private requestHandlerMap: Map<RequestName, Handler>;

    constructor(tracepointManager: TracepointManager, logpointManager: LogpointManager) {
        this.requestHandlerMap = new Map<RequestName, Handler>([
            ['PutTracePointRequest', new PutTracePointMessageHandler(tracepointManager)],
            ['EnableTracePointRequest', new EnableTracePointRequestHandler(tracepointManager)],
            ['DisableTracePointRequest', new DisableTracePointRequestHandler(tracepointManager)],
            ['RemoveTracePointRequest', new RemoveTracePointRequestHandler(tracepointManager)],
            ['RemoveBatchTracePointRequest', new RemoveBatchTracePointRequestHandler(tracepointManager)],
            ['UpdateTracePointRequest', new UpdateTracePointRequestHandler(tracepointManager)],
            ['PutLogPointRequest', new PutLogPointRequestHandler(logpointManager)],
            ['EnableLogPointRequest', new EnableLogPointRequestHandler(logpointManager)],
            ['DisableLogPointRequest', new DisableLogPointRequestHandler(logpointManager)],
            ['RemoveLogPointRequest', new RemoveLogPointRequestHandler(logpointManager)],
            ['RemoveBatchLogPointRequest', new RemoveBatchLogPointRequestHandler(logpointManager)],
            ['UpdateLogPointRequest', new UpdateLogPointRequestHandler(logpointManager)],
        ]);
    }

    getHandler(brokerRequest: BrokerRequest): Handler {
        return this.requestHandlerMap.get(brokerRequest.name);
    }
}