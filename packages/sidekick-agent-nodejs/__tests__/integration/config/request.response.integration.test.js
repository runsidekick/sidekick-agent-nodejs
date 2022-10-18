const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

require('../../config/data/requestresponse/breakpoint-method');

const { 
    GetConfigResponse,
    UpdateConfigRequest,
    AttachRequest,
    DetachRequest,
} = require('../../config/data/requestresponse/config/data');

const { 
    PutTracePointRequest,
} = require('../../config/data/requestresponse/tracepoint/data');

const ProbeUtils = require('../../../dist/utils/ProbeUtils').default;

const { 
    BreakpointMethod,
    CallerBreakpointMethod,
} = require('../../config/data/requestresponse/breakpoint-method');

const { ErrorMethod } = require('../../config/data/requestresponse/error-method');

const ConfigProvider = require('../../../dist/config/ConfigProvider').default;
const { ConfigNames } = require('../../../dist/config/ConfigNames');

const delay = ms => new Promise(res => setTimeout(res, ms));

describe('Config Change Test', function () {
    jest.setTimeout(30000)

    let wss; 
    let wsClient;
    let sidekick;
    let tracePointId;

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

    it('Check GetConfigRequest & GetConfigResponse', (done) => {
        const maxPropertiesValue = 11;
        const validateGetConfigResponse = () => {
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxProperties = ConfigProvider.get(ConfigNames.capture.maxProperties);
            expect(maxProperties).toBe(maxPropertiesValue);
            done();
        }

        const _GetConfigResponse = {
            ...GetConfigResponse,
            ...{
                config: {
                    maxProperties: maxPropertiesValue,
                }
            }
        }
        
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'GetConfigRequest') {
                    wsClient.send(JSON.stringify(_GetConfigResponse));
                }

                if (message.name === 'ApplicationStatusEvent') {
                    validateGetConfigResponse(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
    });

    it('Check UpdateConfigRequest & UpdateConfigResponse', (done) => {
        const maxPropertiesValue = 15;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.removeListener('message', wsClientMessageHandler);
                    const maxProperties = ConfigProvider.get(ConfigNames.capture.maxProperties);
                    expect(maxProperties).toBe(maxPropertiesValue);
                    done();
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxProperties: maxPropertiesValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update MaxFrames', (done) => {
        const maxFramesValue = 1;
        const validateMaxFrames = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxFrames = ConfigProvider.get(ConfigNames.capture.maxFrames);
            expect(maxFrames).toBe(maxFramesValue);
            expect(message.frames.length).toBe(1);
            sidekick.debugApi.delete(breakpoint);
            done();   
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    CallerBreakpointMethod({ field1: 'value1' })
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateMaxFrames(message);   
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxFrames: maxFramesValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update MaxExpandFrames', (done) => {
        const maxExpandFramesValue = 2;
        const validateMaxExpandFrames = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxExpandFrames = ConfigProvider.get(ConfigNames.capture.maxExpandFrames);
            expect(maxExpandFrames).toBe(maxExpandFramesValue);
            expect(message.frames.length).toBe(3);
            expect(message.frames[1].variables.callerField).toBeTruthy();
            expect(JSON.stringify(message.frames[2].variables)).toBe('{}');
            sidekick.debugApi.delete(breakpoint);
            done();   
        }
   
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    CallerBreakpointMethod({ field1: 'value1' })
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateMaxExpandFrames(message);
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxFrames: 10,
                    maxExpandFrames: maxExpandFramesValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update MaxProperties Object', (done) => {
        const maxPropertiesValue = 2;
        const validateMaxProperties = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxProperties = ConfigProvider.get(ConfigNames.capture.maxProperties);
            expect(maxProperties).toBe(maxPropertiesValue);
            expect(Object.keys(message.frames[0].variables.param['@value']).length).toBe(2);
            expect(message.frames[0].variables.param['@value'].field1).toBeTruthy();
            expect(message.frames[0].variables.param['@value'].field2).toBeTruthy();
            sidekick.debugApi.delete(breakpoint);
            done();   
        }
   
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    CallerBreakpointMethod({ field1: 'value1', field2: 'value2', field3: 'value3', field4: 'value4' })
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateMaxProperties(message);
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxProperties: maxPropertiesValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update MaxProperties Array', (done) => {
        const maxPropertiesValue = 2;
        const validateMaxProperties = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxProperties = ConfigProvider.get(ConfigNames.capture.maxProperties);
            expect(maxProperties).toBe(maxPropertiesValue);
            expect(message.frames[0].variables.param['@value'].length).toBe(2);
            expect(message.frames[0].variables.param['@value'][0]['@value']).toBe(1);
            expect(message.frames[0].variables.param['@value'][1]['@value']).toBe(2);
            sidekick.debugApi.delete(breakpoint);
            done();   
        }
   
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    CallerBreakpointMethod([1, 2, 3, 4])
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateMaxProperties(message);
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxProperties: maxPropertiesValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update MaxParse Depth', (done) => {
        const maxParseDepthValue = 2;
        const validateMaxParseDepth = (message) => {
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            const maxParseDepth = ConfigProvider.get(ConfigNames.capture.maxParseDepth);
            expect(maxParseDepth).toBe(2);
            expect(message.frames[0].variables.param['@value'].level1).toBeTruthy();
            expect(message.frames[0].variables.param['@value'].level1['@value'].level2).toBeTruthy();
            expect(message.frames[0].variables.param['@value'].level1['@value'].level2['@value']).toBe('...');
            sidekick.debugApi.delete(breakpoint);
            done();   
        }
   
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    CallerBreakpointMethod({ level1: { level2: { level3: { level4: { level4Field: 'level4Value' } } } }})
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateMaxParseDepth(message);
                }
            } catch (error) {
                done(error);
            }
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxFrames: 1,
                    maxProperties: 10,
                    maxParseDepth: maxParseDepthValue,
                }
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update Error Collection Enable & Disable', (done) => {
        const errorCollectionEnableValue = true;
        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxFrames: 1,
                    maxProperties: 10,
                    errorCollectionEnable: errorCollectionEnableValue,
                }
            }
        }

        const validateErrorEvent = (message) => {
            const errorCollectionEnable = ConfigProvider.get(ConfigNames.errorCollection.enable);
            expect(errorCollectionEnable).toBe(true);
            expect(message.error).toBeTruthy();
            expect(message.error.message).toBe('Error: Error from test.');
            expect(message.frames).toBeUndefined();
            _UpdateConfigRequest.config.errorCollectionEnable = false;
            wsClient.send(JSON.stringify(_UpdateConfigRequest)); 
        }
   
        let flagConfig = 0;
        let errorConfig = 0;
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    if (flagConfig == 0) {
                        setTimeout(() => {
                            try {
                                ErrorMethod();
                            } catch (error) { }
                        }, 1000)
                    } else if (flagConfig == 1) {
                        setTimeout(() => {
                            try {
                                ErrorMethod();
                            } catch (error) { }

                            setTimeout(() => {
                                if (errorConfig == 1) {
                                    wsClient.removeListener('message', wsClientMessageHandler);
                                    done();  
                                } else {
                                    done(new Error('There is an error about enable disable error collection.'));
                                }
                            }, 1000)
                        }, 1000)
                    } else {
                        done(new Error('There is an error about update config.'));
                    }

                    flagConfig += 1; 
                }

                if (message.name === 'ErrorStackSnapshotEvent') {
                    validateErrorEvent(message);
                    errorConfig += 1;
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check Update Error Collection Frame', (done) => {
        const errorCollectionEnableValue = true;
        const errorCollectionEnableCaptureFrameValue = true
        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxFrames: 1,
                    maxProperties: 10,
                    maxParseDepth: 3,
                    errorCollectionEnable: errorCollectionEnableValue,
                    errorCollectionEnableCaptureFrame: errorCollectionEnableCaptureFrameValue
                }
            }
        }

        const validateErrorEvent = (message) => {
            wsClient.removeListener('message', wsClientMessageHandler);
            const errorCollectionEnable = ConfigProvider.get(ConfigNames.errorCollection.enable);
            expect(errorCollectionEnable).toBe(true);
            const errorCollectionEnableCaptureFrame = ConfigProvider.get(ConfigNames.errorCollection.captureFrame);
            expect(errorCollectionEnableCaptureFrame).toBe(true);
            expect(message.error).toBeTruthy();
            expect(message.error.message).toBe('Error: Error from test.');
            expect(message.frames).toBeTruthy();
            expect(message.frames[0].variables.param['@value'].field1).toBeTruthy();
            expect(message.frames[0].variables.param['@value'].field1['@value']).toBe('value1');
            done(); 
        }
   
        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'UpdateConfigResponse') {
                    setTimeout(() => {
                        try {
                            ErrorMethod({ field1: 'value1' });
                        } catch (error) { }
                    }, 1000)
                }

                if (message.name === 'ErrorStackSnapshotEvent') {
                    validateErrorEvent(message);
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(_UpdateConfigRequest));
    });

    it('Check AttachRequest & DetachRequest', (done) => {
        const validateSnapshotEvent = (message) => {   
            const breakpoint = sidekick.debugApi.get(tracePointId);
            wsClient.removeListener('message', wsClientMessageHandler);
            expect(message.tracePointId).toBe(tracePointId.replace('Tracepoint:', ''));
            expect(message.fileName).toBe(PutTracePointRequest.fileName);
            expect(message.lineNo).toBe(PutTracePointRequest.lineNo);
            expect(message.methodName).toBe('BreakpointMethod');
            expect(message.frames).toBeTruthy();
            expect(Object.keys(message.frames[0].variables).length).toBe(2);
            sidekick.debugApi.delete(breakpoint);
            done(); 
        }

        const _UpdateConfigRequest = {
            ...UpdateConfigRequest,
            ...{
                config: {
                    maxProperties: 2,
                }
            }
        }

        const wsClientMessageHandler = (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'DetachResponse') {
                    expect(sidekick.debugApi.connected).toBe(false);
                    setTimeout(async function() {
                        wsClient.send(JSON.stringify(PutTracePointRequest));
                        await delay(2000);
                        const breakpoint = sidekick.debugApi.get(tracePointId);
                        expect(breakpoint).toBeUndefined();
                        wsClient.send(JSON.stringify(AttachRequest));
                    }, 2000); 
                }

                if (message.name === 'AttachResponse') {
                    expect(sidekick.debugApi.connected).toBe(true);
                    wsClient.send(JSON.stringify(_UpdateConfigRequest));
                }

                if (message.name === 'UpdateConfigResponse') {
                    wsClient.send(JSON.stringify(PutTracePointRequest));
                }

                if (message.name === 'PutTracePointResponse') {
                    BreakpointMethod()
                }

                if (message.name === 'TracePointSnapshotEvent') {
                    validateSnapshotEvent(message);   
                }
            } catch (error) {
                done(error);
            }
        }

        wsClient.on('message', wsClientMessageHandler);
        wsClient.send(JSON.stringify(DetachRequest));
    });
});