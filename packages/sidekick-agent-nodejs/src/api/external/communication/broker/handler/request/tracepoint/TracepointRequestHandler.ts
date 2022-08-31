import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerTracePointHandler } from "../../BrokerHandler";

export default abstract class TracepointRequestHandler extends BrokerTracePointHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
}