import DebugApi from "../../api/internal/debug/DebugApi";
import Task from "./Task";

export default class DisabledErrorCollectionActivateTask implements Task {
    private debugApi: DebugApi
    
    constructor(debugApi: DebugApi) {
        this.debugApi = debugApi;
    }

    execute() {
        this.debugApi.enableErrorCollect();
    }
}