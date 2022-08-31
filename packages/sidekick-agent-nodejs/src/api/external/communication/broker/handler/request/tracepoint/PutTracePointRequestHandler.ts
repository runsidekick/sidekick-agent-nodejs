import TracepointManager from '../../../../../manager/TracepointManager';
import { BrokerResponse, PutTracePointRequest, PutTracePointResponse, Tracepoint } from '../../../../../../../types';
import TracepointRequestHandler from './TracepointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class PutTracePointRequestHandler extends TracepointRequestHandler { 
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(putTracePointRequest: PutTracePointRequest): BrokerResponse {
        Logger.debug(`<PutTracePointRequestHandler> Handling put tracepoint message. 
            ${putTracePointRequest.fileName} ${putTracePointRequest.tracePointId}`);

        const response = new PutTracePointResponse(putTracePointRequest.id, putTracePointRequest.client);
        try {
            putTracePointRequest.fileName = 
                this.validateAndGetFileName(putTracePointRequest.fileName);
            this.validateLineNo(putTracePointRequest.lineNo);

            this.tracepointManager.putTracepoint({
                ...putTracePointRequest,
                id: putTracePointRequest.tracePointId,
                tracingEnabled: putTracePointRequest.enableTracing,
            } as Tracepoint);

            CommunicationManager.sendApplicationStatusEvent();
            if (putTracePointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(putTracePointRequest.client)
            }

        } catch (error) {  
            Logger.debug(`<PutTracePointRequestHandler> An error occured while handling put tracepoint message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }
    };
}