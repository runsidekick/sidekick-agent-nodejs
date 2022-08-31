import LogpointManager from '../../../../../manager/LogpointManager';
import { BrokerResponse, PutLogPointRequest, PutLogPointResponse, Logpoint } from '../../../../../../../types';
import LogpointRequestHandler from './LogpointRequestHandler';
import Logger from '../../../../../../../logger';
import CommunicationManager from '../../../../../communication/CommunicationManager';

export default class PutLogPointRequestHandler extends LogpointRequestHandler { 
    constructor(logpointManager: LogpointManager) {
        super(logpointManager);
    }
    
    handle(putLogPointRequest: PutLogPointRequest): BrokerResponse {
        Logger.debug(`<PutLogPointRequestHandler> Handling put logpoint message. 
            ${putLogPointRequest.fileName} ${putLogPointRequest.logPointId}`);

        const response = new PutLogPointResponse(putLogPointRequest.id, putLogPointRequest.client);
        try {
            putLogPointRequest.fileName = 
                this.validateAndGetFileName(putLogPointRequest.fileName);
            this.validateLineNo(putLogPointRequest.lineNo);

            this.logpointManager.putLogpoint({
                ...putLogPointRequest,
                id: putLogPointRequest.logPointId,
            } as Logpoint);

            CommunicationManager.sendApplicationStatusEvent();
            if (putLogPointRequest.client) {
                CommunicationManager.sendApplicationStatusEvent(putLogPointRequest.client)
            }

        } catch (error) {  
            Logger.debug(`<PutLogPointRequestHandler> An error occured while handling put logpoint message. ${error.message}`);
            response.setError(error);     
        } finally {
            return response;
        }
    };
}