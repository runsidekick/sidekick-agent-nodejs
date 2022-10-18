import DebugApi from "src/api/internal/debug/DebugApi";
import ConfigProvider from "../../../config/ConfigProvider";
import { ConfigNames } from '../../../config/ConfigNames';
import CommunicationManager from "../communication/CommunicationManager";
import CommunicationUtils from "../../../utils/CommunicationUtils";

export default interface ConfigManager {
    makeSilent(): void;
    makeUnsilent(): void;
    updateConfig(candidateConfig: { [key: string]: any }): void;
}

export class DefaultConfigManager implements ConfigManager {
    protected debugApi: DebugApi;

    constructor(debugApi: DebugApi) {
        this.debugApi = debugApi;
    }

    makeSilent(): void {
        ConfigProvider.update({ 'silent': true });
        this.debugApi.close();
    }

    makeUnsilent(): void {
        ConfigProvider.update({ 'silent': false });
        this.debugApi.connect();
        CommunicationManager.sendRequest(CommunicationUtils.createTracepointFilterRequest());
        CommunicationManager.sendRequest(CommunicationUtils.createLogpointFilterRequest());
        CommunicationManager.sendRequest(CommunicationUtils.createGetConfigRequest());
    }
    
    updateConfig(candidateConfig: { [key: string]: any }) {
        ConfigProvider.update(candidateConfig);
        const errorCollector = candidateConfig[ConfigNames.errorCollection.enable];
        if (errorCollector != null) {
            errorCollector ? this.debugApi.activateErrorCollection() : this.debugApi.deactivateErrorCollection();
        }
    }
}