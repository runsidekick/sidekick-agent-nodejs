import Handler from "../../../../../../handler/Handler";
import { BrokerResponse, ResponseName } from "../../../../../../types";
import HandlerContainer from "../../../../../../handler/HandlerContainer";
import FilterTracePointsResponseHandler from "./tracepoint/FilterTracePointsResponseHandler";
import FilterLogPointsResponseHandler from "./logpoint/FilterLogPointsResponseHandler";
import GetConfigResponseHandler from './config/GetConfigResponseHandler';
import TracepointManager from "../../../../manager/TracepointManager";
import LogpointManager from "../../../../manager/LogpointManager";
import ConfigManager from "../../../../manager/ConfigManager";

export default class ResponseHandlerContainer implements HandlerContainer {
    private responseHandlerMap: Map<ResponseName, Handler>;

    constructor(
        tracepointManager: TracepointManager,
        logpointManager: LogpointManager,
        configManager: ConfigManager) {
        this.responseHandlerMap = new Map<ResponseName, Handler>([
            ['FilterTracePointsResponse', new FilterTracePointsResponseHandler(tracepointManager)],
            ['FilterLogPointsResponse', new FilterLogPointsResponseHandler(logpointManager)],
            ['GetConfigResponse', new GetConfigResponseHandler(configManager)],
        ]);
    }

    getHandler(brokerResponse: BrokerResponse): Handler {
        return this.responseHandlerMap.get(brokerResponse.name);
    }
}