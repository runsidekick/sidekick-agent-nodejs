import EventEmitter from "events";
import { Message } from "../types";
import HandlerContainer from "../handler/HandlerContainer";
import ApiStatus from "../api/status/ApiStatus";
import CommunicationManager from "../api/external/communication/CommunicationManager";
import Logger from '../logger';

export default interface Listener extends EventEmitter {
    listen(): Promise<void>;
    unlisten(): void;
}

export abstract class SimpleListener extends EventEmitter implements Listener {
    protected apiStatus: ApiStatus;

    constructor(apiStatus: ApiStatus) {
        super();

        this.apiStatus = apiStatus;
    }

    abstract listen(): Promise<void>;
    abstract unlisten(): void;
}

export abstract class MessageHandlerListener extends SimpleListener {
    protected onMessage: any;

    constructor(apiStatus: ApiStatus) {
        super(apiStatus);
        this.onMessage = (message: Message) => setImmediate(() => this.handleMessage(message));
    }
    
    abstract listen(): Promise<void>;
    abstract unlisten(): void;
    protected abstract handleMessage(message: Message): void;
}