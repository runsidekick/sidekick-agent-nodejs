
import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerResponse, RemoveBatchTracePointRequest, RemoveBatchTracePointResponse } from '../../../../../../../types';
import TracepointRequestHandler from './TracepointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class RemoveBatchTracePointRequestHandler extends TracepointRequestHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(removeBatchTracePointRequest: RemoveBatchTracePointRequest): BrokerResponse {
        Logger.debug('<RemoveBatchTracePointRequestHandler> Handling remove batch tracepoint message');

        const response = new RemoveBatchTracePointResponse(removeBatchTracePointRequest.id, removeBatchTracePointRequest.client);
        try {
            for (const tracepointId in removeBatchTracePointRequest.tracePointIds) {
                try {
                    this.tracepointManager.removeTracePoint(tracepointId, removeBatchTracePointRequest.client);
                    response.removedTracePointIds.push(tracepointId);
                } catch (error) {
                    response.unRemovedTracePointIds[tracepointId] = error.message;
                }
            }

            CommunicationManager.sendApplicationStatusEvent();
            if (removeBatchTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(removeBatchTracePointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<RemoveBatchTracePointRequestHandler> An error occured while handling remove batch message. ${error.message}`);
        } finally {
            return response;
        }
    };
}