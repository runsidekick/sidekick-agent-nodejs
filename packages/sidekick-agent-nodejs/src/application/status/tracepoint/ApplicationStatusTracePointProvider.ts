import TracepointManager from "../../../api/external/manager/TracepointManager";
import { ApplicationStatus } from "../../../types";
import ApplicationStatusProvider from "../ApplicationStatusProvider";

export default class ApplicationStatusTracePointProvider implements ApplicationStatusProvider {
    protected tracepointManager: TracepointManager;

    constructor(tracepointManager: TracepointManager) {
        this.tracepointManager = tracepointManager;
    }

    provide(applicationStatus: ApplicationStatus, client?: string) {
        applicationStatus.tracePoints = this.tracepointManager.getAll(client);
    }
}