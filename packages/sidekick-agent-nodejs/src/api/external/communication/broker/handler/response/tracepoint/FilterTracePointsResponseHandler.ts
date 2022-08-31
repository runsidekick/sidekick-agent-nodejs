
import TracepointManager from '../../../../../manager/TracepointManager';
import { FilterTracePointsResponse, Tracepoint } from '../../../../../../../types';
import TracePointsResponseHandler from './TracePointsResponseHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class FilterTracePointsResponseHandler extends TracePointsResponseHandler { 
    constructor(tracepointManager: TracepointManager) {
        super(tracepointManager);
    }
    
    handle(filterTracePointsResponse: FilterTracePointsResponse): void {
        Logger.debug(`<FilterTracePointsResponseHandler> Handling filter tracepoint message. ${filterTracePointsResponse.requestId}`);

        try {
            filterTracePointsResponse.tracePoints.forEach(tracepoint => {
                this.tracepointManager.putTracepoint({
                    ...tracepoint,
                    id: tracepoint.id,
                    fileName: this.extractFileName(tracepoint.fileName),
                    lineNo: tracepoint.lineNo,
                } as Tracepoint);
            });

            CommunicationManager.sendApplicationStatusEvent();
            if (filterTracePointsResponse.client) {
                CommunicationManager.sendApplicationStatusEvent(filterTracePointsResponse.client)
            }
        } catch (error) { 
            Logger.debug(`<FilterTracePointsResponseHandler> An error occured while handling filter message. ${error.message}`);
        }      
    };
}