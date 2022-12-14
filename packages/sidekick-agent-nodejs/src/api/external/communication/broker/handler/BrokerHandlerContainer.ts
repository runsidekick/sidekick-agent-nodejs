import { CommunicationApiData, CommunicationApiDataType } from "../../../../../types";
import RequestHandlerContainer from "./request/RequestHandlerContainer";
import Handler from "../../../../../handler/Handler";
import EventHandlerContainer from "./event/EventHandlerContainer";
import HandlerContainer from "../../../../../handler/HandlerContainer";
import ResponseHandlerContainer from "./response/ResponseHandlerContainer";
import TracepointManager from "../../../manager/TracepointManager";
import LogpointManager from "../../../manager/LogpointManager";
import TagManager from "../../../manager/TagManager";
import ConfigManager from "../../../manager/ConfigManager";

export default class BrokerHandlerContainer implements HandlerContainer {
    private handlerMap: Map<CommunicationApiDataType, HandlerContainer>

    constructor(
        tracepointManager: TracepointManager,
        logpointManager: LogpointManager,
        tagManager: TagManager,
        configManager: ConfigManager) {
        this.handlerMap = new Map<CommunicationApiDataType, HandlerContainer>([
            ['Request', new RequestHandlerContainer(tracepointManager, logpointManager, tagManager, configManager)],
            ['Response', new ResponseHandlerContainer(tracepointManager, logpointManager, configManager)],
            ['Event', new EventHandlerContainer()],
        ]);
    }

    getHandler(communicationApiData: CommunicationApiData): Handler | undefined {
        const handlerContainer = this.handlerMap.get(communicationApiData.type);
        if (!handlerContainer) {
            return;
        }

        return handlerContainer.getHandler(communicationApiData);
    }
}