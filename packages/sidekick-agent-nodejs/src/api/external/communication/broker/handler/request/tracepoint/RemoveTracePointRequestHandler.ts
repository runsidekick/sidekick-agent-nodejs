
import TracepointManager from "../../../../../manager/TracepointManager";
import { BrokerResponse, RemoveTracePointRequest, RemoveTracePointResponse } from "../../../../../../../types";
import TracepointRequestHandler from "./TracepointRequestHandler";
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class RemoveTracePointRequestHandler extends TracepointRequestHandler {
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(removeTracePointRequest: RemoveTracePointRequest): BrokerResponse {
        Logger.debug(`<RemoveTracePointRequestHandler> Handling remove tracepoint message. ${removeTracePointRequest.tracePointId}`);

        const response = new RemoveTracePointResponse(removeTracePointRequest.id, removeTracePointRequest.client);
        try {
            this.tracepointManager.removeTracePoint(
                removeTracePointRequest.tracePointId,
                removeTracePointRequest.client);

            CommunicationManager.sendApplicationStatusEvent();
            if (removeTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(removeTracePointRequest.client)
            }
        } catch (error) {
            Logger.debug(`<RemoveTracePointRequestHandler> An error occured while handling remove message. ${error.message}`);
            response.setError(error); 
        } finally {
            return response;
        }
    };
}