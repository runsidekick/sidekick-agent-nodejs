import LogpointManager from "../../../../../manager/LogpointManager";
import { BrokerLogPointHandler } from "../../BrokerHandler";

export default abstract class LogPointsResponseHandler extends BrokerLogPointHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
}