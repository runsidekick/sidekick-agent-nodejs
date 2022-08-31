import { ConfigNames } from '../config/ConfigNames';

const logger = require('npmlog');

logger.addLevel('debug', 1600, { fg: 'green' });
logger.level = process.env[ConfigNames.agent.logLevel] ?
    process.env[ConfigNames.agent.logLevel].toLowerCase() : 'info';
logger.disableColor();

export type LogLevel = 
| 'debug'
| 'info'
| 'warn'
| 'error'

export default {
    setLogLevel: (logLevel: LogLevel) => {
        logger.level = logLevel;
    },
    info: (message: string): void => {
        logger.info('', message);
    }, 
    warn:(message: string): void => {
        logger.warn('', message);
    }, 
    debug: (message: string): void => {
        logger.debug('', message);
    },
    error: (message: string, err?: Error): void => {
        logger.error('', message, err);
    }
};