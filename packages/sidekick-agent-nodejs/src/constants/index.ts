import { ConfigNames } from "../config/ConfigNames";

export const AGENT_UUID_CONST = '3cda958c-e704-56ff-b519-ab2e3dc3ccb4';
export const SCHEDULAR_SENSITIVITY = 30; // second
export const SCHEDULAR_MAX_SECOND = 60 * 60 * 24; // one day
export const SCHEDULAR_MAX_TICK = SCHEDULAR_MAX_SECOND / SCHEDULAR_SENSITIVITY;

export const  PROBE_DEFAULT_EXPIRY_SECS = 60 * 30 // 30 minutes
export const  PROBE_DEFAULT_EXPIRY_COUNT = 50;
export const  PROBE_MAX_EXPIRY_SECS = 60 * 60 * 24; // 1 day
export const  PROBE_MAX_EXPIRY_COUNT = 1000;

export const ERROR_PROBE_STORE_ID = 'ERROR_PROBE_STORE_ID';

export const ERROR_COLLECTION_DENY_FILE_NAMES = [
    '@runsidekick'
]

export const CONFIG_CONSTANT = {
    [ConfigNames.broker.host]: {
        default: 'wss://broker.service.runsidekick.com'
    },
    [ConfigNames.broker.port]: {
        default: 443
    },
    [ConfigNames.agent.logLevel]: {
        default: 'info',
    },
    [ConfigNames.agent.disable]: {
        default: false,
    },
    [ConfigNames.agent.silent]: {
        default: false,
    },
    [ConfigNames.debugApi.resetV8Debugger]: {
        default: true,
    },
    [ConfigNames.debugApi.resetV8DebuggerThreshold]: {
        default: 100,
    },
    [ConfigNames.debugApi.enableAsyncCallStack]: {
        default: false,
    },
    [ConfigNames.debugApi.cleanupAsyncCallStackInterval]: {
        default: 30 * 1000,
    },
    [ConfigNames.scriptStore.disablePositionCache]: {
        default: false,
    },
    [ConfigNames.scriptStore.hashCheckEnable]: {
        default: false,
    },
    [ConfigNames.rateLimit.inMinute]: {
        default: 200,
    },
    [ConfigNames.capture.maxFrames]: {
        default: 10,
        min: 1,
        max: 20
    },
    [ConfigNames.capture.maxExpandFrames]: {
        default: 1,
        min: 1,
        max: 5
    },
    [ConfigNames.capture.maxProperties]: {
        default: 10,
        min: 1,
        max: 50
    },
    [ConfigNames.capture.maxParseDepth]: {
        default: 3,
        min: 1,
        max: 6
    },
    [ConfigNames.capture.propertyAccessClassification]: {
        default: 'ENUMERABLE-OWN',
    },
    [ConfigNames.sourceCode.minified]: {
        default: false,
    },
    [ConfigNames.broker.client]: {
        default: 'default',
    },
    [ConfigNames.taskExecutionQueue.concurrency]: {
        default: 5,
    },
    [ConfigNames.taskExecutionQueue.maxSize]: {
        default: 10,
    },
    [ConfigNames.agent.rejectOnStartup]: {
        default: false,
    },
    [ConfigNames.dataReduction.captureFrame]: {
        canEnv: false,
    },
    [ConfigNames.dataReduction.logMessage]: {
        canEnv: false,
    },
    [ConfigNames.errorCollection.enable]: {
        default: false,
    },
    [ConfigNames.errorCollection.captureFrame]: {
        default: false,
    },
    [ConfigNames.errorCollection.rateLimit.pointInMinute]: {
        default: 10,
    },
    [ConfigNames.errorCollection.rateLimit.totalInMinute]: {
        default: 100,
    }
}