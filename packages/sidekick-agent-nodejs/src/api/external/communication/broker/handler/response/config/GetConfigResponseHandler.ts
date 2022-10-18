import ConfigManager from '../../../../../manager/ConfigManager';
import { GetConfigResponse } from '../../../../../../../types';
import ConfigResponseHandler from './ConfigResponseHandler';
import CommunicationManager from '../../../../../communication/CommunicationManager';
import Logger from '../../../../../../../logger';

export default class GetConfigResponseHandler extends ConfigResponseHandler { 
    constructor(configManager: ConfigManager) {
        super(configManager);
    }
    
    handle(getConfigResponse: GetConfigResponse): void {
        Logger.debug(`<GetConfigResponseHandler> Handling get config response message. ${getConfigResponse.requestId}`);

        try {
            this.configManager.updateConfig(getConfigResponse.config);

            CommunicationManager.sendApplicationStatusEvent();
            if (getConfigResponse.client) {
                CommunicationManager.sendApplicationStatusEvent(getConfigResponse.client)
            }
        } catch (error) { 
            Logger.debug(`<GetConfigResponseHandler> An error occured while handling get config response message. ${error.message}`);
        }      
    };
}