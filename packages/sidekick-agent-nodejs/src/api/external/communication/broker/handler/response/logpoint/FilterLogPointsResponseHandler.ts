
import LogpointManager from '../../../../../manager/LogpointManager';
import { FilterLogPointsResponse, Logpoint } from '../../../../../../../types';
import logPointsResponseHandler from './LogPointsResponseHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class FilterLogPointsResponseHandler extends logPointsResponseHandler { 
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(filterLogPointsResponse: FilterLogPointsResponse): void {
        Logger.debug(`<FilterLogPointsResponseHandler> Handling filter logpoint message. ${filterLogPointsResponse.requestId}`);

        try {
            filterLogPointsResponse.logPoints.forEach(logpoint => {
                this.logpointManager.putLogpoint({
                    ...logpoint,
                    id: logpoint.id,
                    fileName: this.extractFileName(logpoint.fileName),
                    lineNo: logpoint.lineNo,
                } as Logpoint);
            });

            CommunicationManager.sendApplicationStatusEvent();
            if (filterLogPointsResponse.client) {
                CommunicationManager.sendApplicationStatusEvent(filterLogPointsResponse.client)
            }
        } catch (error) { 
            Logger.debug(`<FilterLogPointsResponseHandler> An error occured while handling filter message. ${error.message}`);
        }      
    };
}