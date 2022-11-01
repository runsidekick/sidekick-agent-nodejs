const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

require('../../config/data/requestresponse/breakpoint-method');

const { 
    PutLogPointRequest,
    EnableLogPointRequest,
    DisableLogPointRequest, 
    UpdateLogPointRequest,
} = require('../../config/data/requestresponse/logpoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

const { BreakpointMethod } = require('../../config/data/requestresponse/breakpoint-method');

describe('Logpoint reqeust & response Test', function () {
    jest.setTimeout(30000)

    let wss; 
    let wsClient;
    let sidekick;
    let logPointId;

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

    it('Check FilterLogPointsRequest', (done) => {
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'FilterLogPointsRequest') {
                    wsClient.removeListener('message', wsClientMessageHandler);
                    done();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
    });

    it('Check PutLogPointRequest', (done) => {
        const validateBreakpointStored = () => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    validateBreakpointStored();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });

    it('Check PutLogPointRequest Actions', (done) => {
        const validateBreakpointActions= (message) => {
            const breakpoint = sidekick.debugApi.get(logPointId);
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
                if (message.name === 'PutLogPointResponse') {
                    validateBreakpointActions(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });

    it('Check DisableLogPointRequest & EnableLogPointRequest', (done) => {
        const validateBreakpointDisabled = () => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.enabled).toBe(false);
            wsClient.send(JSON.stringify(EnableLogPointRequest));
        }

        const validateBreakpointEnabled = () => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.enabled).toBe(true);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    wsClient.send(JSON.stringify(DisableLogPointRequest));
                }
    
                if (message.name === 'DisableLogPointResponse') {
                    validateBreakpointDisabled();
                }
    
                if (message.name === 'EnableLogPointResponse') {
                    validateBreakpointEnabled();
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });

    it('Check UpdateLogPointRequest', (done) => {
        const validateBreakpointUpdated = () => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeTruthy();
            expect(breakpoint.condition).toBe(UpdateLogPointRequest.conditionExpression);
            expect(breakpoint.expireSecs).toBe(UpdateLogPointRequest.expireSecs);
            expect(breakpoint.expireCount).toBe(UpdateLogPointRequest.expireCount);
            sidekick.debugApi.delete(breakpoint);
            done();
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    wsClient.send(JSON.stringify(UpdateLogPointRequest));
                }
    
                if (message.name === 'UpdateLogPointResponse') {
                    validateBreakpointUpdated(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });

    it('Check Failed', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeUndefined();
            expect(message.erroneous).toBe(true);
            expect(message.errorCode).toBe(2050);
            expect(message.errorMessage).toBeTruthy();
            done();
        }

        const _putLogPointRequest = {
            ...PutLogPointRequest,
            fileName: 'test',
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    validateFailed(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putLogPointRequest));
    });

    it('Check Condition Failed', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(logPointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(breakpoint).toBeUndefined();
            expect(message.erroneous).toBe(true);
            expect(message.errorCode).toBe(2050);
            expect(message.errorMessage).toBeTruthy();
            done();
        }

        const _putLogPointRequest = {
            ...PutLogPointRequest,
            conditionExpression: 'a! * ='
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    validateFailed(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_putLogPointRequest));
    });

    it('Check Allread Exist', (done) => {
        const validateFailed = (message) => {
            const breakpoint = sidekick.debugApi.get(logPointId);
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
                if (message.name === 'PutLogPointResponse') {
                    if (flag) {
                        validateFailed(message);
                    } else {
                        wsClient.send(JSON.stringify(PutLogPointRequest));
                    }
                    
                    flag = true;
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(PutLogPointRequest));
    });

    it('Check Expired', (done) => {
        const _putLogPointRequest = {
            ...PutLogPointRequest,
            expireCount: 1,
        }

        let hitCount = 0;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'PutLogPointResponse') {
                    BreakpointMethod();
                }
                
                if (message.name === 'LogPointEvent') {
                    hitCount += 1;
                    BreakpointMethod();

                    setTimeout(() => {
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
        wsClient.send(JSON.stringify(_putLogPointRequest));
    });
});