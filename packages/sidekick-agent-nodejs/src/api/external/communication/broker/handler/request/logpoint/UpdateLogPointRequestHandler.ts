
import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, UpdateLogPointResponse, UpdateLogPointRequest, Logpoint } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class UpdateLogPointRequestHandler extends LogpointRequestHandler {
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(updateLogPointRequest: UpdateLogPointRequest): BrokerResponse {
        Logger.debug(`<UpdateLogPointRequestHandler> Handling update logpoint message. ${updateLogPointRequest.logPointId}`);

        const response = new UpdateLogPointResponse(updateLogPointRequest.id, updateLogPointRequest.client);
        try {
            const logpoint = {
                ...updateLogPointRequest,
                id: updateLogPointRequest.logPointId,
                stdoutEnabled: updateLogPointRequest.stdoutEnabled,
            } as Logpoint;

            this.logpointManager.updateLogPoint(logpoint);

            CommunicationManager.sendApplicationStatusEvent();
            if (updateLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(updateLogPointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<UpdateLogPointRequestHandler> An error occured while handling update message. ${error.message}`);
            response.setError(error);    
        } finally {
            return response;
        }
    };
}