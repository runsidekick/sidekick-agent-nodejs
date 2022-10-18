import EventEmitter from "events";
import { Message } from "../types";
import ApiStatus from "../api/status/ApiStatus";
import { SilentModeAcceptedRequestName, SilentRequestName } from '../types';
import ConfigProvider from "../config/ConfigProvider";
import { ConfigNames } from "../config/ConfigNames";
import Logger from "../logger";

export default interface Listener extends EventEmitter {
    listen(): Promise<void>;
    unlisten(): void;
}

export abstract class SimpleListener extends EventEmitter implements Listener {
    abstract listen(): Promise<void>;
    abstract unlisten(): void;
} 

export abstract class SimpleApiListener extends SimpleListener {
    protected apiStatus: ApiStatus;

    constructor(apiStatus: ApiStatus) {
        super();

        this.apiStatus = apiStatus;
    }

    abstract listen(): Promise<void>;
    abstract unlisten(): void;
}

export abstract class MessageHandlerListener extends SimpleApiListener {
    protected onMessage: any;

    constructor(apiStatus: ApiStatus) {
        super(apiStatus);
        this.onMessage = (message: Message) => setImmediate(() => this._handleMessage(message));
    }
    
    abstract listen(): Promise<void>;
    abstract unlisten(): void;
    protected abstract handleMessage(message: Message): void;
    private _handleMessage(message: Message) {
        if (ConfigProvider.get<boolean>(ConfigNames.agent.silent)
            && !SilentModeAcceptedRequestName.includes(message.name as SilentRequestName)) {
            Logger.debug(`<MessageHandlerListener> Message name: ${message.name} skipped. Agent on silent mode.`)
            return;
        }

        this.handleMessage(message);
    }
}