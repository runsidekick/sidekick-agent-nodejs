import { BaseConfigMetaData } from '../types';
import { SidekickConfig, ConfigNames } from './ConfigNames';
import { CONFIG_CONSTANT } from '../constants';
import ConfigUtils from '../utils/ConfigUtils';

export type SidekickConfigMetaData = BaseConfigMetaData<SidekickConfig | {}> ;

const ConfigMetadata = {
    [ConfigNames.agent.apiKey]: {
        key: 'apiKey',
        type: 'string',
        required: true,
    },
    [ConfigNames.broker.host]: {
        key: 'brokerHost',
        type: 'string',
        default: CONFIG_CONSTANT[ConfigNames.broker.host].default
    },
    [ConfigNames.broker.port]: {
        key: 'brokerPort',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.broker.port].default
    },
    [ConfigNames.agent.logLevel]: {
        key: 'logLevel',
        type: 'string',
        default: CONFIG_CONSTANT[ConfigNames.agent.logLevel].default
    },
    [ConfigNames.agent.disable]: {
        key: 'disable',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.agent.disable].default
    },
    [ConfigNames.agent.silent]: {
        key: 'silent',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.agent.silent].default,
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
        default: CONFIG_CONSTANT[ConfigNames.debugApi.resetV8Debugger].default,
    },
    [ConfigNames.debugApi.resetV8DebuggerThreshold]: {
        key: 'resetV8DebuggerThreshold',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.debugApi.resetV8DebuggerThreshold].default,
    },
    [ConfigNames.debugApi.enableAsyncCallStack]: {
        key: 'enableAsyncCallStack',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.debugApi.enableAsyncCallStack].default,
    },
    [ConfigNames.debugApi.cleanupAsyncCallStackInterval]: {
        key: 'cleanupAsyncCallstackInterval',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.debugApi.cleanupAsyncCallStackInterval].default,
    },
    [ConfigNames.scriptStore.disablePositionCache]: {
        key: 'disablePositionCache',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.scriptStore.disablePositionCache].default,
    },
    [ConfigNames.scriptStore.whilelistModule]: {
        key: 'whilelistModule',
        type: 'array',
    }, 
    [ConfigNames.scriptStore.hashCheckEnable]: {
        key: 'hashCheckEnable',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.scriptStore.hashCheckEnable].default,
    },
    [ConfigNames.rateLimit.inMinute]: {
        key: 'inMinute',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.rateLimit.inMinute].default,
    },
    [ConfigNames.capture.maxFrames]: {
        key: 'maxFrames',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.capture.maxFrames].default,
        get: (value: any) => ConfigUtils.getAvailableNumberValue(value, ConfigNames.capture.maxFrames)
    },
    [ConfigNames.capture.maxExpandFrames]: {
        key: 'maxExpandFrames',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.capture.maxExpandFrames].default,
        get: (value: any) => ConfigUtils.getAvailableNumberValue(value, ConfigNames.capture.maxExpandFrames)
    },
    [ConfigNames.capture.maxProperties]: {
        key: 'maxProperties',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.capture.maxProperties].default,
        get: (value: any) => ConfigUtils.getAvailableNumberValue(value, ConfigNames.capture.maxProperties)
    },
    [ConfigNames.capture.maxParseDepth]: {
        key: 'maxParseDepth',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.capture.maxParseDepth].default,
        get: (value: any) => ConfigUtils.getAvailableNumberValue(value, ConfigNames.capture.maxParseDepth)
    },
    [ConfigNames.capture.propertyAccessClassification]: {
        key: 'propertyAccessClassification',
        type: 'string',
        default: CONFIG_CONSTANT[ConfigNames.capture.propertyAccessClassification].default,
    },
    [ConfigNames.sourceCode.minified]: {
        key: 'minified',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.sourceCode.minified].default,
    },
    [ConfigNames.broker.client]: {
        key: 'brokerClient',
        type: 'string',
        default: CONFIG_CONSTANT[ConfigNames.broker.client].default,
    },
    [ConfigNames.taskExecutionQueue.concurrency]: {
        key: 'tastExecutionQueueConcurrency',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.taskExecutionQueue.concurrency].default
    },
    [ConfigNames.taskExecutionQueue.maxSize]: {
        key: 'tastExecutionQueueMaxSize',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.taskExecutionQueue.maxSize].default
    },
    [ConfigNames.agent.rejectOnStartup]: {
        key: 'rejectOnStartup',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.agent.rejectOnStartup].default
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
        default: CONFIG_CONSTANT[ConfigNames.errorCollection.enable].default,
    },
    [ConfigNames.errorCollection.captureFrame]: {
        key: 'errorCollectionEnableCaptureFrame',
        type: 'boolean',
        default: CONFIG_CONSTANT[ConfigNames.errorCollection.captureFrame].default,
    },
    [ConfigNames.errorCollection.rateLimit.pointInMinute]: {
        key: 'errorCollectionRateLimitPointInMinute',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.errorCollection.rateLimit.pointInMinute].default,
    },
    [ConfigNames.errorCollection.rateLimit.totalInMinute]: {
        key: 'errorCollectionRateLimitTotalInMinute',
        type: 'number',
        default: CONFIG_CONSTANT[ConfigNames.errorCollection.rateLimit.totalInMinute].default,
    }
} as SidekickConfigMetaData

export default ConfigMetadata;