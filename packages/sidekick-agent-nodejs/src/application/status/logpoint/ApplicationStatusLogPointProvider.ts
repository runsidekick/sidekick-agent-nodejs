import LogpointManager from "../../../api/external/manager/LogpointManager";
import { ApplicationStatus } from "../../../types";
import ApplicationStatusProvider from "../ApplicationStatusProvider";

export default class ApplicationStatusLogPointProvider implements ApplicationStatusProvider {
    protected logpointManager: LogpointManager;

    constructor(logpointManager: LogpointManager) {
        this.logpointManager = logpointManager;
    }

    provide(applicationStatus: ApplicationStatus, client?: string) {
        applicationStatus.logPoints = this.logpointManager.getAll(client);
    }
}