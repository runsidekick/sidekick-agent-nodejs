import { CONFIG_CONSTANT } from "../constants"

export default class ConfigUtils {
    static getAvailableNumberValue = (value: number, property: string) => {
        return value < CONFIG_CONSTANT[property].min
            ? CONFIG_CONSTANT[property].default
            : value > CONFIG_CONSTANT[property].max
                ? CONFIG_CONSTANT[property].max
                : value;
    }
}