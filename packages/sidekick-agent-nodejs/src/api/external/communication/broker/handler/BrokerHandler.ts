import TracepointManager from "../../../manager/TracepointManager";
import LogpointManager from "../../../manager/LogpointManager";
import TagManager from "../../../manager/TagManager";
import ConfigManager from "../../../manager/ConfigManager";
import Handler from "../../../../../handler/Handler";
import { CommunicationApiData } from "../../../../../types";
import * as ProbeErrors from '../../../../../error/ProbeErrors';
import ProbeUtils from "../../../../../utils/ProbeUtils";

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

export abstract class BrokerTagHandler extends BrokerHandler {
    protected tagManager: TagManager;
    
    constructor(tagManager: TagManager) {
        super();

        this.tagManager = tagManager;
    }

    abstract handle(data: CommunicationApiData): any | undefined;
}

export abstract class BrokerConfigHandler extends BrokerHandler {
    protected configManager: ConfigManager;
    
    constructor(configManager: ConfigManager) {
        super();

        this.configManager = configManager;
    }

    abstract handle(data: CommunicationApiData): any | undefined;
}