
import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerResponse, UpdateTracePointResponse, UpdateTracePointRequest, Tracepoint } from '../../../../../../../types';
import TracepointRequestHandler from './TracepointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class UpdateTracePointRequestHandler extends TracepointRequestHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(updateTracePointRequest: UpdateTracePointRequest): BrokerResponse {
        Logger.debug(`<UpdateTracePointRequestHandler> Handling update tracepoint message. ${updateTracePointRequest.tracePointId}`);

        const response = new UpdateTracePointResponse(updateTracePointRequest.id, updateTracePointRequest.client);
        try {
            const tracepoint = {
                ...updateTracePointRequest,
                id: updateTracePointRequest.tracePointId,
                tracingEnabled: updateTracePointRequest.enableTracing,
            } as Tracepoint;

            this.tracepointManager.updateTracePoint(tracepoint);

            CommunicationManager.sendApplicationStatusEvent();
            if (updateTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(updateTracePointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<UpdateTracePointRequestHandler> An error occured while handling update message. ${error.message}`);
            response.setError(error);    
        } finally {
            return response;
        }
    };
}