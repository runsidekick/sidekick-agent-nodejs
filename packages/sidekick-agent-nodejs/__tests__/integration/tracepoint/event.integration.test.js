const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');

const { PutTracePointRequest } = require('../../config/data/requestresponse/tracepoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

describe('Tracepoint Snapshot Event Test', function () {
    jest.setTimeout(30000)
    
    let wss; 
    let wsClient;
    let sidekick;
    
    beforeAll(async () => {
        const port = await getRandomPort();
        wss = new WebSocketServer({ port });
        wss.on('connection', function connection(ws) {
            wsClient = ws;
        });
        
        sidekick = await start({
            apiKey: 'foo',
            brokerHost: 'ws://localhost',
            brokerPort: port,
            hashCheckDisable: true,
            inMinute: 1
        });

        tracePointId = ProbeUtils.getProbeId({
            ...PutTracePointRequest,
            id: PutTracePointRequest.tracePointId,
            type: 'Tracepoint',
        });
    });
    
    afterAll(async () => {
        if (wsClient) {
            wsClient = null;
        }
        
        stop();
        if (wss) {
            wss.close();
        }
    });
    
    it('Check Snapshot Event', (done) => {
        const validateSnapshotEvent = (message) => {   
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(message.tracePointId).toBe(tracePointId.replace('Tracepoint:', ''));
            expect(message.fileName).toBe(PutTracePointRequest.fileName);
            expect(message.lineNo).toBe(PutTracePointRequest.lineNo);
            expect(message.methodName).toBe('BreakpointMethod');
            expect(message.frames).toBeTruthy();
            sidekick.debugApi.delete(breakpoint);
            done(); 
        }
        
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    BreakpointMethod();
                }
                
                if (message.name === 'TracePointSnapshotEvent') {
                    validateSnapshotEvent(message);
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });
});