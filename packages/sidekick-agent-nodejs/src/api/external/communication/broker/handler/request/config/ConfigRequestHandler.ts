import ConfigManager from '../../../../../manager/ConfigManager';
import { BrokerConfigHandler } from "../../BrokerHandler";

export default abstract class ConfigRequestHandler extends BrokerConfigHandler {
    constructor(configManager: ConfigManager) {
        super(configManager);
    }
}