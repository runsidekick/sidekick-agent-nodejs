
import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, EnableLogPointRequest, EnableLogPointResponse } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class EnableLogPointRequestHandler extends LogpointRequestHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(enableLogPointRequest: EnableLogPointRequest): BrokerResponse {
        Logger.debug(`<EnableLogPointRequestHandler> Handling enable logpoint message. ${enableLogPointRequest.logPointId}`);

        const response = new EnableLogPointResponse(enableLogPointRequest.id, enableLogPointRequest.client);
        try {
            this.logpointManager.enableLogPoint(
                enableLogPointRequest.logPointId,
                enableLogPointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (enableLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(enableLogPointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<EnableLogPointRequestHandler> An error occured while handling enable message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}