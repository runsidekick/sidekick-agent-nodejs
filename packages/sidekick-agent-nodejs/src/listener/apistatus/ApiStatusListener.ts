import ApiStatus, { ApiStatusEventNames } from "../../api/status/ApiStatus";
import { MessageHandlerListener } from "../Listener";
import { InternalMessage } from "../../types";
import BufferedCommunicationApi from "../../api/external/communication/BufferedCommunicationApi";
import Logger from '../../logger';

export default class ApiStatusListener extends MessageHandlerListener {
    protected bufferedCommunicationApi: BufferedCommunicationApi
    
    constructor(bufferedCommunicationApi: BufferedCommunicationApi, apiStatus: ApiStatus) {
        super(apiStatus);
        this.bufferedCommunicationApi = bufferedCommunicationApi;
    }

    listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                Logger.debug(`<ApiStatusListener> Trying to listen api status ...`);
                this.apiStatus.on(ApiStatusEventNames.STATUSCHANGED, this.onMessage);
                resolve();
            } catch (error) {
                Logger.error('<ApiStatusListener> An error occured while to listen api status.');
                reject(error)
            }
        });
    }

    unlisten(): void {
        Logger.debug('<ApiStatusListener> Unlisten api status.');
        this.apiStatus.removeListener(ApiStatusEventNames.STATUSCHANGED, this.onMessage);
    }

    protected handleMessage(message: InternalMessage): void {
        if (message.data) {
            let flag = true; 
            Object.keys(message.data).forEach(key => {
                if (flag && !message.data[key]) {
                    flag = false;
                }
            })

            Logger.debug(`<ApiStatusListener> Api status will set to ${flag}.`);
            flag ? this.bufferedCommunicationApi.unsilent() : this.bufferedCommunicationApi.silent();
        }
    }
}