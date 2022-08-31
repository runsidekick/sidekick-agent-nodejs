import TypeCastUtils from "../utils/TypeCastUtils";
import ConfigValidationError from "../error/ConfigValidationError";
import { 
    BaseConfig,
    BaseConfigMetaData,
    ConfigProviderModel
} from "../types";

export default class ConfigProvider {

    static configMetadata: BaseConfigMetaData<BaseConfig>;

    static config: BaseConfig;

    static init(configProviderModel: ConfigProviderModel<BaseConfig, BaseConfigMetaData<BaseConfig>>): void {
        ConfigProvider.configMetadata = configProviderModel && configProviderModel.configMetaData || {} as BaseConfigMetaData<BaseConfig>;
        const userConfig = configProviderModel && configProviderModel.config || {} as BaseConfig;

        const systemConfig: BaseConfig = {};
        Object.keys(ConfigProvider.configMetadata).forEach(key => {
            const configMeta = ConfigProvider.configMetadata[key];
            const configKey = configMeta.key;
            const configDefault = configMeta.default;
            const configRequired = configMeta.required;
            const configType = configMeta.type;
            const configCanEnv = configMeta.canEnv;
            if (!userConfig[configKey] && configCanEnv != false) {
                const environmentValue = process.env[key];
                if (configType === 'map') {
                    Object.keys(process.env).forEach(environmentKey => {
                        if (environmentKey.startsWith(key)) {
                            if (!userConfig[configKey]) {
                                userConfig[configKey] = {};
                            }
                            
                            const rawMapKey = environmentKey.substring(key.length, environmentKey.length);
                            if (rawMapKey) {
                                userConfig[configKey][rawMapKey.replace(/\.|_/g, '')] = process.env[environmentKey];
                            }                           
                        }
                    });
                } else if (configType === 'array') {
                    Object.keys(process.env).forEach(environmentKey => {
                        if (environmentKey.startsWith(key)) {
                            if (!userConfig[configKey]) {
                                userConfig[configKey] = [];
                            }

                            userConfig[configKey].push(process.env[environmentKey])
                        }
                    });
                } else if (environmentValue) {          
                    systemConfig[configKey] = environmentValue;
                } else if (configDefault) {
                    systemConfig[configKey] = configDefault;
                }
            }
            
            if (configRequired && !userConfig[configKey] && !systemConfig[configKey]) {
                throw new ConfigValidationError(`Config: ${configKey} must be filled!`)
            }
        });

        ConfigProvider.config = { ...userConfig, ...systemConfig } as BaseConfig;
    }

    static get<T>(key: string, defaultValue?: T): T {
        const value: T = ConfigProvider.config[key] 
            || (ConfigProvider.configMetadata[key] && ConfigProvider.configMetadata[key].key 
                ? ConfigProvider.config[ConfigProvider.configMetadata[key].key] : undefined);
        const type = ConfigProvider.configMetadata[key].type;

        let result = value;
        if (result == undefined) {
            if (defaultValue !== undefined) {
                result = defaultValue;
            } else if (ConfigProvider.configMetadata[key]) {
                result = ConfigProvider.configMetadata[key].default;
            }
        }

        return TypeCastUtils.castToType(result, type) as T;
    }
}
