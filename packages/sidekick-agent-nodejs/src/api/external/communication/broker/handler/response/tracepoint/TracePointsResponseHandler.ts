import TracepointManager from "../../../../../manager/TracepointManager";
import { BrokerTracePointHandler } from "../../BrokerHandler";

export default abstract class TracePointsResponseHandler extends BrokerTracePointHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
}