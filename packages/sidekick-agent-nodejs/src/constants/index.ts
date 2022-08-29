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