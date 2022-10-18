import TagManager from '../../../../../manager/TagManager';
import { 
    BrokerResponse,
    EnableProbeTagRequest,
    EnableProbeTagResponse,
} from '../../../../../../../types';
import TagRequestHandler from './TagRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class EnableProbeTagRequestHandler extends TagRequestHandler { 
    constructor(tagManager: TagManager) {
        super(tagManager);
    }
    
    handle(enableProbeTagRequest: EnableProbeTagRequest): BrokerResponse {
        Logger.debug(`<EnableProbeTagRequestHandler> Handling enable tag message. 
            ${enableProbeTagRequest.tag}`);

        const response = new EnableProbeTagResponse(enableProbeTagRequest.id, enableProbeTagRequest.client);
        try {
            this.tagManager.enableTag(enableProbeTagRequest.tag);

            CommunicationManager.sendApplicationStatusEvent();
            if (enableProbeTagRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(enableProbeTagRequest.client)
            }

        } catch (error) {  
            Logger.debug(`<EnableProbeTagRequestHandler> An error occured while handling enable tag message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }
    };
}