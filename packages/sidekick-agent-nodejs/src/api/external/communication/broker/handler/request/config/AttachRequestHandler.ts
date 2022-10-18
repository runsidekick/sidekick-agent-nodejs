import ConfigManager from '../../../../../manager/ConfigManager';
import { AttachRequest, AttachResponse, BrokerResponse } from '../../../../../../../types';
import ConfigRequestHandler from './ConfigRequestHandler';
import CommunicationManager from '../../../../CommunicationManager';
import Logger from '../../../../../../../logger';

export default class AttachRequestHandler extends ConfigRequestHandler { 
    constructor(configManager: ConfigManager) {
        super(configManager);
    }
    
    handle(attachRequest: AttachRequest): BrokerResponse {
        Logger.debug('<AttachRequestHandler> Handling attach reqeust message.');

        const response = new AttachResponse(attachRequest.id, attachRequest.client);
        try {
            this.configManager.makeUnsilent();

            CommunicationManager.sendApplicationStatusEvent();
            if (attachRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(attachRequest.client)
            }
        } catch (error) { 
            Logger.debug(`<AttachRequestHandler> An error occured while handling attach reqeust message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }     
    };
}