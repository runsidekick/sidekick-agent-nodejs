import { ConfigNames } from "../../config/ConfigNames";
import ConfigProvider from "../../config/ConfigProvider";
import DebugApi from "../../api/internal/debug/DebugApi";
import Task from "./Task";

export default class DisabledErrorCollectionActivateTask implements Task {
    private debugApi: DebugApi
    
    constructor(debugApi: DebugApi) {
        this.debugApi = debugApi;
    }

    execute() {
        if (!ConfigProvider.get<boolean>(ConfigNames.agent.silent) &&
            ConfigProvider.get<boolean>(ConfigNames.errorCollection.enable)) {
            this.debugApi.enableErrorCollect();
        }
    }
}