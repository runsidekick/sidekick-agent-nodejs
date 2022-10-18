const { WebSocketServer } = require('ws');
const { getRandomPort } = require('../../config/utils/port-utils');

const {
    start,
    stop,
} = require('../../../dist'); 

const { ErrorMethod } = require('../../config/data/requestresponse/error-method');

describe('Error Event Test', function () {
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
            inMinute: 1,
            errorCollectionEnable: true,
            errorCollectionEnableCaptureFrame: true,
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
    
    it('Check Error Event', (done) => {
        const wsClientMessageHandler = (data) => {
            const validateErrorEvent = (message) => {
                wsClient.removeListener('message', wsClientMessageHandler);
                expect(message.error).toBeTruthy();
                expect(message.error.message).toBe('Error: Error from test.');
                expect(message.frames).toBeTruthy();
                expect(message.frames.length).toBe(2);
                done();
            }

            try {
                const message = JSON.parse(data.toString());
                if (message.name === 'FilterLogPointsRequest') {
                    try {
                        ErrorMethod();
                    } catch (error) { }     
                }

                if (message.name === 'ErrorStackSnapshotEvent') {
                    validateErrorEvent(message);
                }
            } catch (error) {
                done(error);
            }
        }
        
        wsClient.on('message', wsClientMessageHandler);
    });
});