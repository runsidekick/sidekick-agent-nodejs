import ApplicationInfo from "./ApplicationInfo";
import ApplicationInfoProvider from "./ApplicationInfoProvider";
import ConfigProvider from '../config/ConfigProvider';
import { ConfigNames } from '../config/ConfigNames';
import UuidUtils from '../utils/UuidUtils';
const os = require("os");

export default class ConfigAwareApplicationInfoProvider extends ApplicationInfoProvider {
    private applicationInfo : ApplicationInfo;
    
    constructor() {
        super()

        const hostname = os.hostname();
        const applicationName = ConfigProvider.get<string>(ConfigNames.application.name, hostname);
        this.applicationInfo = new ApplicationInfo(
            ConfigProvider.get<string>(ConfigNames.application.id, `nodejs:${applicationName}`),
            ConfigProvider.get<string>(ConfigNames.application.instanceId, `${process.pid}:${UuidUtils.generateId()}@${hostname}`),
            applicationName,
            ConfigProvider.get<string>(ConfigNames.application.version, ''),
            ConfigProvider.get<string>(ConfigNames.application.stage, ''),
            'nodejs',
            hostname,
            process.version,
            ConfigProvider.get<{[key: string]: any}>(ConfigNames.application.tag, {}),      
        )
    }

    getApplicationInfo(): ApplicationInfo {
        return this.applicationInfo;
    }
}