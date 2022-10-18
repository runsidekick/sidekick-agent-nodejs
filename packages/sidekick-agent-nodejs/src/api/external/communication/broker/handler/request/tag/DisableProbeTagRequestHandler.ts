import TagManager from '../../../../../manager/TagManager';
import { 
    BrokerResponse,
    DisableProbeTagRequest,
    DisableProbeTagResponse,
} from '../../../../../../../types';
import TagRequestHandler from './TagRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class DisableProbeTagRequestHandler extends TagRequestHandler { 
    constructor(tagManager: TagManager) {
        super(tagManager);
    }
    
    handle(disableProbeTagRequest: DisableProbeTagRequest): BrokerResponse {
        Logger.debug(`<DisableProbeTagRequestHandler> Handling disable tag message. 
            ${disableProbeTagRequest.tag}`);

        const response = new DisableProbeTagResponse(disableProbeTagRequest.id, disableProbeTagRequest.client);
        try {
            this.tagManager.disableTag(disableProbeTagRequest.tag);

            CommunicationManager.sendApplicationStatusEvent();
            if (disableProbeTagRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(disableProbeTagRequest.client)
            }

        } catch (error) {  
            Logger.debug(`<DisableProbeTagRequestHandler> An error occured while handling disable tag message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }
    };
}