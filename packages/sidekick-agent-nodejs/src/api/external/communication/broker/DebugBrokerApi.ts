import CommunicationApi, { CommunicationApiEventNames } from "../CommunicationApi";

import { ClientOptions, WebSocket } from 'ws';
import EventEmitter from "events";
import { ClientRequestArgs } from "http";
import ConfigProvider from '../../../../config/ConfigProvider';
import { ConfigNames } from '../../../../config/ConfigNames';
import Application from '../../../../application/Application';
import { CommunicationApiData } from "../../../../types";
import Logger from '../../../../logger';

export default class DebugBrokerApi extends EventEmitter implements CommunicationApi {
    private static API_KEY_HEADER_NAME = "x-sidekick-api-key";
    private static APP_INSTANCE_ID_HEADER_NAME = "x-sidekick-app-instance-id";
    private static APP_NAME_HEADER_NAME = "x-sidekick-app-name";
    private static APP_STAGE_HEADER_NAME = "x-sidekick-app-stage";
    private static APP_VERSION_HEADER_NAME = "x-sidekick-app-version";
    private static APP_HOSTNAME_HEADER_NAME = "x-sidekick-app-hostname";
    private static APP_RUNTIME_HEADER_NAME = "x-sidekick-app-runtime";
    private static APP_TAG_HEADER_NAME_PREFIX = "x-sidekick-app-tag-";

    protected address?: string | URL;
    protected options?: ClientOptions | ClientRequestArgs;
    protected ws: WebSocket; 
    protected connected = true;

    constructor(address: string | URL, options?: ClientOptions | ClientRequestArgs) {
        super();

        this.address = address;
        this.options = options;  
    }

    static generateBrokerUrl(host: string, port: number): string {
        if (host.startsWith("ws://") || host.startsWith("wss://")) {
            return host + ":" + port;
        } else {
            return "wss://" + host + ":" + port;
        }
    }

    static generateBrokerHeaders(): { [key: string]: string } {
        const headers: { [key: string]: string } = {};

        const applicationInfo = Application.getApplicationInfo();

        headers[DebugBrokerApi.API_KEY_HEADER_NAME] = ConfigProvider.get<string>(ConfigNames.agent.apiKey);
        headers[DebugBrokerApi.APP_INSTANCE_ID_HEADER_NAME] = applicationInfo.applicationInstanceId;
        headers[DebugBrokerApi.APP_NAME_HEADER_NAME] = applicationInfo.applicationName;
        headers[DebugBrokerApi.APP_STAGE_HEADER_NAME] = applicationInfo.applicationStage;
        headers[DebugBrokerApi.APP_VERSION_HEADER_NAME] = applicationInfo.applicationVersion;
        headers[DebugBrokerApi.APP_HOSTNAME_HEADER_NAME] = applicationInfo.hostname;
        headers[DebugBrokerApi.APP_RUNTIME_HEADER_NAME] = applicationInfo.applicationRuntime;

        if (applicationInfo.applicationTags) {
            Object.keys(applicationInfo.applicationTags).forEach(key => {
                const headerKey = `${DebugBrokerApi.APP_TAG_HEADER_NAME_PREFIX}${key}`;
                if (!headers[headerKey]) {
                    headers[headerKey] = applicationInfo.applicationTags[key];
                }
            })
        }

        return headers;
    }

    connect(): void {
        this.tryConnect();
    }

    reconnect(): void {
        this.tryConnect();
    }

    close(): void {
        this.connected = false;
        if (this.ws.readyState == 1) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(data: CommunicationApiData): Promise<unknown> {
        return new Promise((resolve, reject) => {
            if (this.ws.readyState == 1) {
                this.ws.send(JSON.stringify(data), (err) => {
                    if (err) {
                        return reject(err)
                    }

                    resolve('');
                });
            } else {
                resolve('');
            }
        })
    }

    private tryConnect() {
        this.ws = new WebSocket(`${this.address}/app`, this.options);
        this.ws.once('open', () => {
            Logger.debug('<DebugBrokerApi> Broker connection established')
            this.connected = true;
            this._emit(CommunicationApiEventNames.OPEN, this);
        });

        this.ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            this._emit(CommunicationApiEventNames.MESSAGE, message);
        });
        
        this.ws.on('error', (err) => {
            this.connected = true;
            Logger.debug(`<DebugBrokerApi> An error occured on broker connection. ${err.message}`)
            this._emit(CommunicationApiEventNames.ERROR, err.message);
        });

        this.ws.once('close', (code, reason) => {
            Logger.debug(`<DebugBrokerApi> Connection closed with broker. Code: ${code} Reason: ${reason}`);
            this._emit(CommunicationApiEventNames.CLOSE, { code, reason });
            this.connected = false;
        });
    }

    private _emit(event: string, data: any) {
        if (this.connected) {
            this.emit(event, data);
        }
    }
}