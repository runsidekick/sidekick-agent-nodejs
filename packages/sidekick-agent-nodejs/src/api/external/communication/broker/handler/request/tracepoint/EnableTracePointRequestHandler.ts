
import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerResponse, EnableTracePointRequest, EnableTracePointResponse } from '../../../../../../../types';
import TracepointRequestHandler from './TracepointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class EnableTracePointRequestHandler extends TracepointRequestHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(enableTracePointRequest: EnableTracePointRequest): BrokerResponse {
        Logger.debug(`<EnableTracePointRequestHandler> Handling enable tracepoint message. ${enableTracePointRequest.tracePointId}`);

        const response = new EnableTracePointResponse(enableTracePointRequest.id, enableTracePointRequest.client);
        try {
            this.tracepointManager.enableTracePoint(
                enableTracePointRequest.tracePointId,
                enableTracePointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (enableTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(enableTracePointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<EnableTracePointRequestHandler> An error occured while handling enable message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}