import EventEmitter from "events";

export interface Api {}

export interface Listenable extends EventEmitter, Api { }

export const ConnectableApiEventNames = {
    OPEN: 'OPEN',
    ERROR: 'ERROR',
    CLOSE: 'CLOSE',
}

export interface ConnectableApi extends Listenable {
    connect(): void;
    reconnect(): void;
    close(): void;
}