import { BaseConfigMetaData } from '../types';
import { SidekickConfig, ConfigNames } from './ConfigNames';

export type SidekickConfigMetaData = BaseConfigMetaData<SidekickConfig | {}> ;

export default {
    [ConfigNames.agent.apiKey]: {
        key: 'apiKey',
        type: 'string',
        required: true,
    },
    [ConfigNames.broker.host]: {
        key: 'brokerHost',
        type: 'string',
        default: 'wss://broker.service.runsidekick.com'
    },
    [ConfigNames.broker.port]: {
        key: 'brokerPort',
        type: 'number',
        default: 443
    },
    [ConfigNames.agent.logLevel]: {
        key: 'logLevel',
        type: 'string',
        default: 'info',
    },
    [ConfigNames.agent.disable]: {
        key: 'disable',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.application.tag]: {
        key: 'applicationTag',
        type: 'map',
    },
    [ConfigNames.application.id]: {
        key: 'applicationId',
        type: 'string',
    },
    [ConfigNames.application.instanceId]: {
        key: 'applicationInstanceId',
        type: 'string',
    },
    [ConfigNames.application.name]: {
        key: 'applicationName',
        type: 'string',
    },
    [ConfigNames.application.version]: {
        key: 'applicationVersion',
        type: 'string',
    },
    [ConfigNames.application.stage]: {
        key: 'applicationStage',
        type: 'string',
    },
    [ConfigNames.debugApi.resetV8Debugger]: {
        key: 'resetV8Debugger',
        type: 'boolean',
        default: true,
    },
    [ConfigNames.debugApi.resetV8DebuggerThreshold]: {
        key: 'resetV8DebuggerThreshold',
        type: 'number',
        default: 100,
    },
    [ConfigNames.debugApi.enableAsyncCallStack]: {
        key: 'enableAsyncCallStack',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.debugApi.cleanupAsyncCallStackInterval]: {
        key: 'cleanupAsyncCallstackInterval',
        type: 'number',
        default: 30 * 1000,
    },
    [ConfigNames.scriptStore.disablePositionCache]: {
        key: 'disablePositionCache',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.scriptStore.whilelistModule]: {
        key: 'whilelistModule',
        type: 'array',
    }, 
    [ConfigNames.scriptStore.hashCheckEnable]: {
        key: 'hashCheckEnable',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.rateLimit.inMinute]: {
        key: 'inMinute',
        type: 'number',
        default: 200,
    },
    [ConfigNames.capture.maxFrames]: {
        key: 'maxFrames',
        type: 'number',
        default: 20,
    },
    [ConfigNames.capture.maxExpandFrames]: {
        key: 'maxExpandFrames',
        type: 'number',
        default: 1,
    },
    [ConfigNames.capture.maxProperties]: {
        key: 'maxProperties',
        type: 'number',
        default: 10,
    },
    [ConfigNames.capture.maxParseDepth]: {
        key: 'maxParseDepth',
        type: 'number',
        default: 3,
    },
    [ConfigNames.broker.client]: {
        key: 'brokerClient',
        type: 'string',
        default: 'default',
    },
    [ConfigNames.taskExecutionQueue.concurrency]: {
        key: 'tastExecutionQueueConcurrency',
        type: 'number',
        default: 5,
    },
    [ConfigNames.taskExecutionQueue.maxSize]: {
        key: 'tastExecutionQueueMaxSize',
        type: 'number',
        default: 10,
    },
    [ConfigNames.agent.rejectOnStartup]: {
        key: 'rejectOnStartup',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.scriptStore.prefix]: {
        key: 'scriptPrefix',
        type: 'string',
    },
    [ConfigNames.dataReduction.captureFrame]: {
        key: 'captureFrameDataReductionCallback',
        type: 'function',
        canEnv: false,
    },
    [ConfigNames.dataReduction.logMessage]: {
        key: 'logMessageDataReductionCallback',
        type: 'function',
        canEnv: false,
    },
    [ConfigNames.errorCollection.enable]: {
        key: 'errorCollectionEnable',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.errorCollection.captureFrame]: {
        key: 'errorCollectionEnableCaptureFrame',
        type: 'boolean',
        default: false,
    },
    [ConfigNames.errorCollection.rateLimit.pointInMinute]: {
        key: 'errorCollectionRateLimitPointInMinute',
        type: 'number',
        default: 10,
    },
    [ConfigNames.errorCollection.rateLimit.totalInMinute]: {
        key: 'errorCollectionRateLimitTotalInMinute',
        type: 'number',
        default: 100,
    }
} as SidekickConfigMetaData;