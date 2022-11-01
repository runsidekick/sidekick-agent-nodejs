const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');
const { PutLogPointRequest } = require('../../config/data/requestresponse/logpoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

describe('Logpoint Event Test', function () {
    jest.setTimeout(30000)
    
    let wss; 
    let wsClient;
    let sidekick;
    let logPointId;
    
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

        logPointId = ProbeUtils.getProbeId({
            ...PutLogPointRequest,
            id: PutLogPointRequest.logPointId,
            type: 'Logpoint',
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
    
    
    it('Check logpoint Event', (done) => {
        const validateLogpointEvent = (message) => {   
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(message.logPointId).toBe(logPointId.replace('Logpoint:', ''));
            expect(message.fileName).toBe(PutLogPointRequest.fileName);
            expect(message.lineNo).toBe(PutLogPointRequest.lineNo);
            expect(message.methodName).toBe('BreakpointMethod');
            expect(message.logMessage).toBe('Hello Thundra!');
            sidekick.debugApi.delete(breakpoint);
            done();
            
        }
        
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    BreakpointMethod({
                        item1: 'Thundra!'
                    });
                }
                
                if (message.name === 'LogPointEvent') {
                    validateLogpointEvent(message);
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });
});