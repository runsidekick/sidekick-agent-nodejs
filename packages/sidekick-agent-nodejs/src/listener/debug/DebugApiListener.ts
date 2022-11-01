import DebugApi, { DebugApiEventNames } from "../../api/internal/debug/DebugApi";
import { SimpleApiListener } from "../Listener";
import ApiStatus from '../../api/status/ApiStatus';
import Logger from '../../logger';

export default class DebugApiListener extends SimpleApiListener {
    private debugApi: DebugApi;

    constructor(debugApi: DebugApi, apiStatus: ApiStatus) {
        super(apiStatus);
        this.debugApi = debugApi;
    }

    listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                Logger.debug('<DebugApiListener> Trying to listen debug api ...');
                const open = () => {
                    Logger.debug('<DebugApiListener> Debug api listening.');
                    this.apiStatus.setStatus(this.debugApi.constructor.name, true);
                    resolve();
                };

                const close = () => {
                    Logger.debug('<DebugApiListener> Comminication api connection closed.');
                    this.apiStatus.setStatus(this.debugApi.constructor.name, false);
                }

                this.debugApi.on(DebugApiEventNames.OPEN, open);
                this.debugApi.on(DebugApiEventNames.CLOSE, close);

                this.debugApi.connect();
            } catch (error) {
                reject();
            }
        });
    }

    unlisten(): void {
        Logger.debug('<DebugApiListener> Unlisten debug api.');
        this.debugApi.close();
    }
}