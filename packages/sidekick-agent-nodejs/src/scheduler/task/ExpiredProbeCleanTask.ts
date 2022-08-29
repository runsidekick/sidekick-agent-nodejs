import ProbeStore from "../../store/probe/ProbeStore";
import Task from "./Task";

export default class ExpiredProbeCleanTask implements Task {
    private probeStore: ProbeStore
    
    constructor(probeStore: ProbeStore) {
        this.probeStore = probeStore;
    }

    execute() {
        this.probeStore.deleteExpiredProbes();
    }
}