import ConfigManager from '../../../../../manager/ConfigManager';
import { UpdateConfigRequest, UpdateConfigResponse, BrokerResponse } from '../../../../../../../types';
import ConfigRequestHandler from './ConfigRequestHandler';
import CommunicationManager from '../../../../../communication/CommunicationManager';
import Logger from '../../../../../../../logger';

export default class UpdateConfigRequestHandler extends ConfigRequestHandler { 
    constructor(configManager: ConfigManager) {
        super(configManager);
    }
    
    handle(updateConfigRequest: UpdateConfigRequest): BrokerResponse {
        Logger.debug('<UpdateConfigRequestHandler> Handling update config reqeust message.');

        const response = new UpdateConfigResponse(updateConfigRequest.id, updateConfigRequest.client);
        try {
            this.configManager.updateConfig(updateConfigRequest.config);

            CommunicationManager.sendApplicationStatusEvent();
            if (updateConfigRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(updateConfigRequest.client)
            }
        } catch (error) { 
            Logger.debug(`<UpdateConfigRequestHandler> An error occured while handling update config reqeust message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}