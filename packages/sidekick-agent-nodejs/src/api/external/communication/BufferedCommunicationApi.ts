import EventEmitter from "events";
import { CommunicationApiData } from "../../../types";
import CommunicationApi, { CommunicationApiEventNames } from './CommunicationApi';
import TaskExecutorQueue, { TaskExecutorPQueue } from '../../../store/queue/TaskExecutorQueue';
import Logger from '../../../logger';
import ConfigProvider from "../../../config/ConfigProvider";
import { ConfigNames } from "../../../config/ConfigNames";

export default interface BufferedCommunicationApi extends CommunicationApi {
    silent(): void;
    unsilent(): void;
}

export class DefaultBufferedCommunicationApi extends EventEmitter implements BufferedCommunicationApi {
    protected taskExecutorQueue: TaskExecutorQueue;
    protected communicationApi: CommunicationApi;
    protected connected: boolean;

    constructor(communicationApi: CommunicationApi) {
        super();

        this.communicationApi = communicationApi;
        this.taskExecutorQueue = new TaskExecutorPQueue(ConfigProvider.get<number>(ConfigNames.taskExecutionQueue.concurrency));

        this.communicationApi.on(CommunicationApiEventNames.OPEN, (data) => this._emit(CommunicationApiEventNames.OPEN, data));
        this.communicationApi.on(CommunicationApiEventNames.ERROR, (data) => this._emit(CommunicationApiEventNames.ERROR, data));
        this.communicationApi.on(CommunicationApiEventNames.CLOSE, (data) => this._emit(CommunicationApiEventNames.CLOSE, data));
        this.communicationApi.on(CommunicationApiEventNames.MESSAGE, (data) => this.onMessage(data));

        this.unsilent();
    }

    connect(): void {
        this.communicationApi.connect();
        this.connected = true;
    }

    reconnect(): void {
        this.connected = false;
        this.communicationApi.reconnect();
        this.connected = true;
    }

    close(): void {
        this.connected = false;

        this.communicationApi.removeAllListeners(CommunicationApiEventNames.OPEN);
        this.communicationApi.removeAllListeners(CommunicationApiEventNames.ERROR);
        this.communicationApi.removeAllListeners(CommunicationApiEventNames.CLOSE);
        this.communicationApi.removeAllListeners(CommunicationApiEventNames.MESSAGE);
        
        this.communicationApi.close();
    }

    send(data: CommunicationApiData) {
        if (this.taskExecutorQueue) {
           this.taskExecutorQueue.execute(() => {
                try {
                    this.communicationApi.send(data);
                } catch (error) {
                    Logger.debug(`<DefaultBufferedCommunicationApi> An error occured while sending task. ${error.message}`);
                }   
            });
        }
    }

    silent(): void {
        this.taskExecutorQueue.pause();
    }

    unsilent(): void {
        this.taskExecutorQueue.start();
    }

    protected onMessage(data: any): void {
        if (this.taskExecutorQueue) {
            this.taskExecutorQueue.execute(() => {
                try {
                    this._emit(CommunicationApiEventNames.MESSAGE, data);
                } catch (error) {
                    Logger.debug(`<DefaultBufferedCommunicationApi> An error occured while emiting new message. ${error.message}`);
                }   
            });
        }
    }

    private _emit(event: string, data: any) {
        if (this.connected) {
            this.emit(event, data);
        }
    }
}