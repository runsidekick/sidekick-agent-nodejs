
import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, DisableLogPointRequest, DisableLogPointResponse } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class DisableLogPointRequestHandler extends LogpointRequestHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(disableLogPointRequest: DisableLogPointRequest): BrokerResponse {
        Logger.debug(`<DisableLogPointRequestHandler> Handling disable logpoint message. ${disableLogPointRequest.logPointId}`);

        const response = new DisableLogPointResponse(disableLogPointRequest.id, disableLogPointRequest.client);
        try {
            this.logpointManager.disableLogPoint(
                disableLogPointRequest.logPointId,
                disableLogPointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (disableLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(disableLogPointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<DisableLogPointRequestHandler> An error occured while handling disable message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}