import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerResponse, DisableTracePointRequest, DisableTracePointResponse } from '../../../../../../../types';
import TracepointRequestHandler from './TracepointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class DisableTracePointRequestHandler extends TracepointRequestHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(disableTracePointRequest: DisableTracePointRequest): BrokerResponse {
        Logger.debug(`<DisableTracePointRequestHandler> Handling disable tracepoint message. ${disableTracePointRequest.tracePointId}`);

        const response = new DisableTracePointResponse(disableTracePointRequest.id, disableTracePointRequest.client);
        try {
            this.tracepointManager.disableTracePoint(
                disableTracePointRequest.tracePointId,
                disableTracePointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (disableTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(disableTracePointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<DisableTracePointRequestHandler> An error occured while handling disable message. ${error.message}`);
            response.setError(error);    
        } finally {
            return response;
        }
    };
}