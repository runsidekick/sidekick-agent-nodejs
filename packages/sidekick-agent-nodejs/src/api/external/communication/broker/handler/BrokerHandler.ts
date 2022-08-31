import TracepointManager from "../../../manager/TracepointManager";
import LogpointManager from "../../../manager/LogpointManager";
import Handler from "../../../../../handler/Handler";
import { ApplicationStatusEvent, CommunicationApiData } from "../../../../../types";
import * as ProbeErrors from '../../../../../error/ProbeErrors';
import ProbeUtils from "../../../../../utils/ProbeUtils";
import Application from "../../../../../application/Application";
import UuidUtils from "../../../../../utils/UuidUtils";
import CommunicationManager from "../../CommunicationManager";

export default abstract class BrokerHandler implements Handler {
    abstract handle(data: CommunicationApiData): any | undefined;

    protected validateLineNo(lineNo: number) {
        if (lineNo <= 0) {
            throw new ProbeErrors.LineNumberIsMandatory();
        }
    }

    protected validateAndGetFileName(filename: string) {
        if (!filename) {
            throw new ProbeErrors.FileNameIsMandatory();
        }

        return filename;
    }

    protected extractFileName(filename: string) {
        return ProbeUtils.extractFileNameFrom(filename, 'contents');
    }
} 

export abstract class BrokerTracePointHandler extends BrokerHandler {
    protected tracepointManager: TracepointManager;
    
    constructor(tracepointManager: TracepointManager) {
        super();

        this.tracepointManager = tracepointManager;
    }

    abstract handle(data: CommunicationApiData): any | undefined;
}

export abstract class BrokerLogPointHandler extends BrokerHandler {
    protected logpointManager: LogpointManager;
    
    constructor(logpointManager: LogpointManager) {
        super();

        this.logpointManager = logpointManager;
    }

    abstract handle(data: CommunicationApiData): any | undefined;
}