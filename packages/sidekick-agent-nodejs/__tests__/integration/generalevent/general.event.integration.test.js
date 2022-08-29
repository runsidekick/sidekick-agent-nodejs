const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');
const { PutTracePointRequest } = require('../../config/data/requestresponse/tracepoint/data');

const { ApplicationStatusEventSchema } = require('../../config/data/event/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

describe('General Event Test', function () {
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
            id: PutTracePointRequest.tracePointId
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
    
    it('Check Application Status Event', (done) => {
        const validateApplicationStatusEvent = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            ApplicationStatusEventSchema.validate(message);
            wsClient.removeListener('message', wsClientMessageHandler);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'ApplicationStatusEvent') {
                    validateApplicationStatusEvent(message);        
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check Rate Limit Status Event', (done) => { 
        const validateRateLimitEvent = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            ApplicationStatusEventSchema.validate(message);
            wsClient.removeListener('message', wsClientMessageHandler);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    BreakpointMethod();
                }

                if (message.name === 'ProbeRateLimitEvent') {
                    validateRateLimitEvent(message);     
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });
});