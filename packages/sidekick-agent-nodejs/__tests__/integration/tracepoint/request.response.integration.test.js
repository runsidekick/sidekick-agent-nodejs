const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

require('../../config/data/requestresponse/breakpoint-method');

const { 
    PutTracePointRequest,
    EnableTracePointRequest,
    DisableTracePointRequest, 
    UpdateTracePointRequest,
} = require('../../config/data/requestresponse/tracepoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');

describe('Tracepoint reqeust & response Test', function () {
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

    it('Check FilterTracePointsRequest', (done) => {
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'FilterTracePointsRequest') {
                    wsClient.removeListener('message', wsClientMessageHandler);
                    done();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
    });

    it('Check PutTracePointRequest', (done) => {
        const validateBreakpointStored = () => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateBreakpointStored();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check PutTracePointRequest Actions', (done) => {
        const validateBreakpointActions= (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(false);
            expect(breakpoint.tags).toBeUndefined();
            expect(breakpoint.actions).toBeTruthy();
            expect(breakpoint.actions.length).toBe(3);
            expect(breakpoint.actions.includes('ConditionAwareProbeAction')).toBe(true);
            expect(breakpoint.actions.includes('RateLimitedProbeAction')).toBe(true);
            expect(breakpoint.actions.includes('ExpiringProbeAction')).toBe(true);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateBreakpointActions(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check DisableTracePointRequest & EnableTracePointRequest', (done) => {
        const validateBreakpointDisabled = () => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.enabled).toBe(false);
            wsClient.send(JSON.stringify(EnableTracePointRequest));
        }

        const validateBreakpointEnabled = () => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.enabled).toBe(true);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    wsClient.send(JSON.stringify(DisableTracePointRequest));
                }
    
                if (message.name === 'DisableTracePointResponse') {
                    validateBreakpointDisabled();
                }
    
                if (message.name === 'EnableTracePointResponse') {
                    validateBreakpointEnabled();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check UpdateTracePointRequest', (done) => {
        const validateBreakpointUpdated = () => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.condition).toBe(UpdateTracePointRequest.conditionExpression);
            expect(breakpoint.expireSecs).toBe(UpdateTracePointRequest.expireSecs);
            expect(breakpoint.expireCount).toBe(UpdateTracePointRequest.expireCount);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    wsClient.send(JSON.stringify(UpdateTracePointRequest));
                }
    
                if (message.name === 'UpdateTracePointResponse') {
                    validateBreakpointUpdated(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check Failed', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeUndefined();
            expect(message.erroneous).toBe(true);
            expect(message.errorCode).toBe(2050);
            expect(message.errorMessage).toBeTruthy();
            done();
        }

        const _putTracePointRequest = {
            ...PutTracePointRequest,
            fileName: 'test',
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateFailed(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    });

    it('Check Condition Failed', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeUndefined();
            expect(message.erroneous).toBe(true);
            expect(message.errorCode).toBe(2050);
            expect(message.errorMessage).toBeTruthy();
            done();
        }

        const _putTracePointRequest = {
            ...PutTracePointRequest,
            conditionExpression: 'a! * ='
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    validateFailed(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    });

    it('Check Allread Exist', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(message.erroneous).toBe(true);
            expect(message.errorCode).toBe(2000);
            expect(message.errorMessage).toBeTruthy();
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        let flag = false;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    if (flag) {
                        validateFailed(message);
                    } else {
                        wsClient.send(JSON.stringify(PutTracePointRequest));
                    }
                    
                    flag = true;
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutTracePointRequest));
    });

    it('Check Expired', (done) => {
        const _putTracePointRequest = {
            ...PutTracePointRequest,
            expireCount: 1,
        }

        let hitCount = 0;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutTracePointResponse') {
                    BreakpointMethod();
                }
                
                if (message.name === 'TracePointSnapshotEvent') {
                    hitCount += 1;
                    BreakpointMethod();
                    setTimeout(function() {
                        if (hitCount == 1) {
                            done();
                        } else {
                            done(new Error(`There is an error on expiration. hitCount: ${hitCount}`));
                        }
                    }, 2000);
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putTracePointRequest));
    });
});