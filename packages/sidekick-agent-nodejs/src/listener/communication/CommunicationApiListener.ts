import CommunicationApi, { CommunicationApiEventNames } from "../../api/external/communication/CommunicationApi";
import { MessageHandlerListener } from "../Listener";
import HandlerContainer from "../../handler/HandlerContainer";
import ApiStatus from '../../api/status/ApiStatus';
import CommunicationManager from "../../api/external/communication/CommunicationManager";
import CommunicationUtils from "../../utils/CommunicationUtils";
import { Message } from "../../types";
import DebugApi from "../../api/internal/debug/DebugApi";
import Logger from '../../logger';

export default class CommunicationApiListener extends MessageHandlerListener {
    protected communicationApi: CommunicationApi;
    protected handlerContainer: HandlerContainer;
    protected debugApi: DebugApi;
    protected firstConnection = true;
    protected retryConnection = true;

    constructor(
        communicationApi: CommunicationApi,
        handlerContainer: HandlerContainer, 
        debugApi: DebugApi,
        apiStatus: ApiStatus,
    ) {
        super(apiStatus);

        this.communicationApi = communicationApi;
        this.handlerContainer = handlerContainer;
        this.debugApi = debugApi;
    }

    listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                Logger.debug('<CommunicationApiListener> Trying to listen Communication api ...');

                const open = () => {
                    this.firstConnection = false;
                    Logger.debug('<CommunicationApiListener> Communication api listening.');
                    CommunicationManager.setCommunicationApi(this.communicationApi);
                    this.apiStatus.setStatus(this.communicationApi.constructor.name, true);
                    this.communicationApi.on(CommunicationApiEventNames.MESSAGE, this.onMessage);
                    CommunicationManager.sendRequest(CommunicationUtils.createTracepointFilterRequest());
                    CommunicationManager.sendRequest(CommunicationUtils.createLogpointFilterRequest());
                    resolve();
                }

                const error = (message: string) => {
                    Logger.error(`<CommunicationApiListener> An error occured on socket connection: ${message}`);
                    if (this.firstConnection && message && message.includes('401')) {
                        this.retryConnection = false;
                    }
                }

                const close = () => {
                    Logger.debug('<CommunicationApiListener> Communication api connection closed.');
                    this.apiStatus.setStatus(this.communicationApi.constructor.name, false);
                    this.communicationApi.removeListener(CommunicationApiEventNames.MESSAGE, this.onMessage);
                    if (this.retryConnection) {
                        setTimeout(() => {
                            Logger.debug('<CommunicationApiListener> Try to reconnect communication api.');
                            this.communicationApi.reconnect();
                        }, 3000)
                    } else if (this.firstConnection) {
                        reject('Connection did not established with broker.');
                    }
                }

                this.communicationApi.on(CommunicationApiEventNames.OPEN, open);
                this.communicationApi.on(CommunicationApiEventNames.ERROR, error);
                this.communicationApi.on(CommunicationApiEventNames.CLOSE, close);

                this.communicationApi.connect();
            } catch (error) {
                Logger.error('<CommunicationApiListener> An error occured while to listen communication api.');
                reject();
            }
        })
    }

    unlisten(): void {
        Logger.debug('<CommunicationApiListener> Unlisten communication api.');
        this.communicationApi.removeListener(CommunicationApiEventNames.MESSAGE, this.onMessage);
        this.communicationApi.close();
        this.apiStatus.setStatus(this.communicationApi.constructor.name, false);
    }

    protected async handleMessage(message: Message) {
        try {
            Logger.debug(`<CommunicationApiListener> Handle message.`);
            const handler = this.handlerContainer.getHandler(message);
            if (!handler) {
                Logger.debug(`<CommunicationApiListener> Handler not found for message.`);
                return;
            }
    
            const response = handler.handle(message);
            if (response) {
                Logger.debug(`<CommunicationApiListener> Response send to communication api.`);
                CommunicationManager.sendResponse(response);
            }
        } catch (error) {
            Logger.error(`<CommunicationApiListener> An error occured while handling message.`);
        }
    }
}