import TagManager from '../../../../../manager/TagManager';
import { 
    BrokerResponse,
    RemoveProbeTagRequest,
    RemoveProbeTagResponse,
} from '../../../../../../../types';
import TagRequestHandler from './TagRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class RemoveProbeTagRequestHandler extends TagRequestHandler { 
    constructor(tagManager: TagManager) {
        super(tagManager);
    }
    
    handle(removeProbeTagRequest: RemoveProbeTagRequest): BrokerResponse {
        Logger.debug(`<RemoveProbeTagRequestHandler> Handling Remove tag message. 
            ${removeProbeTagRequest.tag}`);

        const response = new RemoveProbeTagResponse(removeProbeTagRequest.id, removeProbeTagRequest.client);
        try {
            this.tagManager.removeTag(removeProbeTagRequest.tag);

            CommunicationManager.sendApplicationStatusEvent();
            if (removeProbeTagRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(removeProbeTagRequest.client)
            }

        } catch (error) {  
            Logger.debug(`<RemoveProbeTagRequestHandler> An error occured while handling Remove tag message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }
    };
}