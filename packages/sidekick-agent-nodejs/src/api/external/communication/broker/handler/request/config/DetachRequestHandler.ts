import ConfigManager from '../../../../../manager/ConfigManager';
import { DetachRequest, DetachResponse, BrokerResponse } from '../../../../../../../types';
import ConfigRequestHandler from './ConfigRequestHandler';
import CommunicationManager from '../../../../CommunicationManager';
import Logger from '../../../../../../../logger';

export default class DetachRequestHandler extends ConfigRequestHandler { 
    constructor(configManager: ConfigManager) {
        super(configManager);
    }
    
    handle(detachRequest: DetachRequest): BrokerResponse {
        Logger.debug('<DetachRequestHandler> Handling deattach reqeust message.');

        const response = new DetachResponse(detachRequest.id, detachRequest.client);
        try {
            this.configManager.makeSilent();

            CommunicationManager.sendApplicationStatusEvent();
            if (detachRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(detachRequest.client)
            }
        } catch (error) { 
            Logger.debug(`<DetachRequestHandler> An error occured while handling deattach reqeust message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }     
    };
}