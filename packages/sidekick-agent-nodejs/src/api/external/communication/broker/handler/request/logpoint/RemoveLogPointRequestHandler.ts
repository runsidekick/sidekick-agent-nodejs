
import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, RemoveLogPointRequest, RemoveLogPointResponse } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class RemoveLogPointRequestHandler extends LogpointRequestHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(removeLogPointRequest: RemoveLogPointRequest): BrokerResponse {
        Logger.debug(`<RemoveLogPointRequestHandler> Handling remove logpoint message. ${removeLogPointRequest.logPointId}`);

        const response = new RemoveLogPointResponse(removeLogPointRequest.id, removeLogPointRequest.client);
        try {
            this.logpointManager.removeLogPoint(
                removeLogPointRequest.logPointId,
                removeLogPointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (removeLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(removeLogPointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<RemoveLogPointRequestHandler> An error occured while handling remove message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}