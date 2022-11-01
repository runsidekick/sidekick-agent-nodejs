import { ConfigNames } from "../../config/ConfigNames";
import ConfigProvider from "../../config/ConfigProvider";
import ProbeStore from "../../store/probe/ProbeStore";
import Task from "./Task";

export default class ExpiredProbeCleanTask implements Task {
    private probeStore: ProbeStore
    
    constructor(probeStore: ProbeStore) {
        this.probeStore = probeStore;
    }

    execute() {
        if (!ConfigProvider.get<boolean>(ConfigNames.agent.silent)) {
            this.probeStore.deleteExpiredProbes();
        }
    }
}