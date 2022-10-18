import TypeCastUtils from "../utils/TypeCastUtils";
import ConfigValidationError from "../error/ConfigValidationError";
import { 
    BaseConfig,
    BaseConfigMetaData,
    ConfigProviderModel
} from "../types";
import { EditableConfigNames } from './ConfigNames';

export default class ConfigProvider {

    static configMetadata: BaseConfigMetaData<BaseConfig>;

    static config: BaseConfig;

    static configChangedSubscribers = new Set<(change: { [key: string]: any }) => void>();

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

        if (value == undefined && !ConfigProvider.configMetadata[key]) {
            return;
        }

        const type = ConfigProvider.configMetadata[key].type;
        let result = value;
        if (result == undefined) {
            if (defaultValue !== undefined) {
                result = defaultValue;
            } else if (ConfigProvider.configMetadata[key]) {
                result = ConfigProvider.configMetadata[key].default;
            }
        }

        let resultValue = result;
        if (ConfigProvider.configMetadata[key].get) {
            resultValue = ConfigProvider.configMetadata[key].get(result);
        }

        return TypeCastUtils.castToType(resultValue, type) as T;
    }

    static update(candidateConfig: { [key: string]: any }) {
        let changed = false;
        let change: { [key: string]: any} = {}
        Object.keys(candidateConfig || {}).forEach(key => {
            const environmentKey = EditableConfigNames[key];
            if (environmentKey) {
                const key = ConfigProvider.configMetadata[environmentKey] 
                    ? ConfigProvider.configMetadata[environmentKey].key
                    : undefined;

                if (key && ConfigProvider.config[key] != candidateConfig[key]) {
                    ConfigProvider.config[key] = candidateConfig[key];
                    change[key] = candidateConfig[key];
                    changed = true;
                }
            }
        });

        if (changed) {
            ConfigProvider.configChangedSubscribers.forEach(subscriber => {
                subscriber(change);
            });
        }
    }

    static subscribeConfigChanged(callback: (change: { [key: string]: any }) => void) {
        ConfigProvider.configChangedSubscribers.add(callback);
    }

    static unsubscribeConfigChanged(callback: (change: { [key: string]: any }) => void) {
        ConfigProvider.configChangedSubscribers.delete(callback);
    }
}
