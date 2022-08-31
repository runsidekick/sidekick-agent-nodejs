
import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, RemoveBatchLogPointRequest, RemoveBatchLogPointResponse } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class RemoveBatchLogPointRequestHandler extends LogpointRequestHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(removeBatchLogPointRequest: RemoveBatchLogPointRequest): BrokerResponse {
        Logger.debug('<RemoveBatchLogPointRequestHandler> Handling remove batch logpoint message');

        const response = new RemoveBatchLogPointResponse(removeBatchLogPointRequest.id, removeBatchLogPointRequest.client);
        try {
            for (const logpointId in removeBatchLogPointRequest.logPointIds) {
                try {
                    this.logpointManager.removeLogPoint(logpointId, removeBatchLogPointRequest.client);
                    response.removedLogPointIds.push(logpointId);
                } catch (error) {
                    response.unRemovedLogPointIds[logpointId] = error.message;
                }
            }

            CommunicationManager.sendApplicationStatusEvent();
            if (removeBatchLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(removeBatchLogPointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<RemoveBatchLogPointRequestHandler> An error occured while handling remove batch message. ${error.message}`);
        } finally {
            return response;
        }
    };
}