import EventEmitter from "events";
import { Listenable } from "../Api";

export const ApiStatusEventNames = {
    STATUSCHANGED: 'STATUSCHANGED',
}

export default class ApiStatus extends EventEmitter implements Listenable {
    private statusMap: Map<string, boolean>;

    constructor(statusMap?: Map<string, boolean>) {
        super();
        this.statusMap = statusMap || new Map<string, boolean>();
    }

    getStatus(key: string) {
        return this.statusMap.get(key);
    }

    setStatus(key: string, status: boolean) {
        const currentStatus = this.statusMap.get(key);
        if (currentStatus !== undefined && currentStatus == status) {
            return;
        }

        this.statusMap.set(key, status);
        this.emit(ApiStatusEventNames.STATUSCHANGED, { 
            type: 'ApiStatus',
            name: 'StatusChanged',
            data: {
                [key]: status
            }
         })
    }

    disableStatuses() {
        this.statusMap.forEach((status, key) => {
            this.statusMap.set(key, false);
        })
    }
}