import Handler from "../../../../../../handler/Handler";
import HandlerContainer from "../../../../../../handler/HandlerContainer";
import { Message } from "../../../../../../types";

export default class EventHandlerContainer implements HandlerContainer {
    private eventHandlerMap: Map<string, Handler>;

    constructor() {
        this.eventHandlerMap = new Map([]);
    }

    getHandler(message: Message): Handler {
        return this.eventHandlerMap.get(message.name);
    }
}