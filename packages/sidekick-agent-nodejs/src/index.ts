import { SidekickConfig, ConfigNames } from "./config/ConfigNames";
import SidekickManager from "./manager/SidekickManager"
import ConfigMetadata from './config/ConfigMetadata';
import ConfigProvider from './config/ConfigProvider';
import Logger, { LogLevel } from './logger';
import Application from './application/Application';
import ConfigAwareApplicationInfoProvider from "./application/ConfigAwareApplicationInfoProvider";
import FileUtils from './utils/FileUtils';
import * as path from 'path';

let sidekickManager: SidekickManager;

/**
 * @param  {SidekickConfig} options?
 * @returns Promise
 */
export const start = (options?: SidekickConfig): Promise<SidekickManager> | undefined => {
    if (sidekickManager) {
        Logger.error('<Sidekick> Debug Agent has already been started.');
        return;
    }

    try {
        FileUtils.statSync(path.join(process.cwd(), 'package.json'))
    } catch (error) {
        Logger.error('<Sidekick> No package.json located in working directory.', error);
        return;
    }

    try {
        ConfigProvider.init({
            config: options || {} as SidekickConfig,
            configMetaData: ConfigMetadata
        });
    } catch (error) {
        Logger.error('<Sidekick> An error occured while parsing config.', error);
        return;
    }

    if (ConfigProvider.get<boolean>(ConfigNames.agent.disable)) {
        Logger.info(`<Sidekick> Agent disabled.`);
        return;
    }

    Application.setApplicationInfoProvider(new ConfigAwareApplicationInfoProvider());

    const logLevel = ConfigProvider.get<LogLevel>(ConfigNames.agent.logLevel);
    Logger.setLogLevel(logLevel);

    Logger.info('<Sidekick> Agent starting ...');

    sidekickManager = new SidekickManager();
    const startPromise = sidekickManager.start();
    /**
     * encapsulate rejection of start promise
     */
    if (!ConfigProvider.get<boolean>(ConfigNames.agent.rejectOnStartup)) {
        startPromise.catch(() => { /** no need to log, already logged */});
    }

    return startPromise;
}

/**
 * @returns Sidekick
 */
export const get = (): SidekickManager | undefined => {
    return sidekickManager;
}

/**
 * Stop Sideckick
 */
export const stop = () => {
    if (sidekickManager) {
        sidekickManager.stop();
        sidekickManager = null;
    }
}