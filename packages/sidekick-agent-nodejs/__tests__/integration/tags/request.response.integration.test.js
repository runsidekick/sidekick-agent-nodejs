const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

require('../../config/data/requestresponse/breakpoint-method');

const { 
    PutTracePointRequest,
    EnableProbeTagRequest,
    DisableProbeTagRequest,
} = require('../../config/data/requestresponse/tracepoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');

describe('Tags Test', function () {
    jest.setTimeout(30000)

    let wss; 
    let wsClient;
    let sidekick;
    let tracePointId;

    const tag1 = 'tag1';
    const tag2 = 'tag2';
    const tags = [tag1, tag2];

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

    it('Check Tags', (done) => { 
        const validateTag = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(false);
            expect(breakpoint.tags).toBeTruthy();
            expect(breakpoint.tags.length).toBe(2);
            expect(breakpoint.actions).toBeTruthy();
            expect(breakpoint.actions.length).toBe(2);
            expect(breakpoint.actions.includes('ExpiringProbeAction')).toBe(false);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const _putTracePointRequest = {
            ...PutTracePointRequest,
            tags,
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateTag(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    })

    it('Check Tags Enable & Disable', (done) => {
        const validateTag = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(false);
            expect(breakpoint.tags).toBeTruthy();
            expect(breakpoint.tags.length).toBe(2);
            expect(breakpoint.tags.includes(tag1)).toBe(true);
            expect(breakpoint.tags.includes(tag2)).toBe(true);
            wsClient.send(JSON.stringify(DisableProbeTagRequest));
        }

        const validateEnableTag = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(false);
            expect(breakpoint.enabled).toBe(true);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const validateDisableTag = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(false);
            expect(breakpoint.enabled).toBe(false);
            wsClient.send(JSON.stringify(EnableProbeTagRequest));
        }

        const _putTracePointRequest = {
            ...PutTracePointRequest,
            tags,
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateTag(message);
                }

                if (message.name === 'EnableProbeTagResponse') {
                    validateEnableTag(message);
                }

                if (message.name === 'DisableProbeTagResponse') {
                    validateDisableTag(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    });

    it('Check Tags Not Expired', (done) => {
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
        
        const _putTracePointRequest = {
            ...PutTracePointRequest,
            expireCount: 1,
            tags,
        }

        let flag = false;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    BreakpointMethod();
                }
                
                if (message.name === 'TracePointSnapshotEvent') {
                    if (flag) {
                        validateSnapshotEvent(message);
                    } else {
                        flag = true
                        BreakpointMethod();
                    }
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    });
});