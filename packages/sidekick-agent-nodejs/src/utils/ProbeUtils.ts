import { Probe } from "../types";
import UuidUtils from "./UuidUtils";
import * as acorn from 'acorn';
import * as ProbeErrors from '../error/ProbeErrors';
import ProbeErrorCodes from "../error/ProbeErrorCodes";
import CodedError from "../error/CodedError";
import {
    PROBE_DEFAULT_EXPIRY_SECS,
    PROBE_DEFAULT_EXPIRY_COUNT,
    PROBE_MAX_EXPIRY_SECS,
    PROBE_MAX_EXPIRY_COUNT,
} from '../constants';
import ConfigProvider from "../config/ConfigProvider";
import { ConfigNames } from "../config/ConfigNames";

const AstValidator = require('./AstValidator').default;

export default class ProbeUtils {
    static getProbeId(probe: Probe) {
        return `${probe.action}:${probe.id}`;
    }

    static extractFileNameFrom(filename: string, extractText: string) {
        const idx = filename.indexOf(extractText);
        if (idx >= 0) {
            filename = filename.substring(idx + extractText.length).split('?')[0];
        }

        return filename;
    }

    static formatErrorMesage(rawMessage: string, data: { [key: string]: any }, reason: string = ''): string {
        try {
            let result = rawMessage;
            (Object.keys(data) || []).forEach(key => {
                const regexp = new RegExp('\\{' + key + '\\}', 'gi');
                result = result.replace(regexp, data[key]);
            })
    
            if (reason) {
                result = result.replace('{reason}', reason);
            }
    
            return result;
        } catch (error) {
            return reason || rawMessage;
        }
    }
    
    static generateLocationId(probe: Probe) {
        return UuidUtils.generareIdFrom(`${probe.fileName}${probe.lineNo}${probe.client}`);
    }
    
    static validateCondition(probe: Probe) {
        if (probe.condition) {
            const ast: acorn.Node | null = acorn.parse(probe.condition, {
                sourceType: 'script',
                ecmaVersion: 6,
            });
    
            if (!AstValidator.isValid(ast)) {
                throw new ProbeErrors.ConditionNotValid(`Condition '${probe.condition}' is not valid`);
            }
        }
    }

    static getCodedError(error: Error, data: any) {
        return ProbeUtils.getCodedErrorByName(error.constructor.name, data, error.message);
    }

    static getCodedErrorByName(errorName: string, data: any, reason?: string) {
        const knownError = ProbeErrorCodes[errorName];
        if (!knownError) {
            return;
        }

        return new CodedError(
            knownError.code,
            ProbeUtils.formatErrorMesage(
                knownError.message,
                data,
                reason,
        ));
    }

    static extractFileName(filename: string) {
        return ProbeUtils.extractFileNameFrom(filename, 'contents');
    }

    static fillProbeId(probe: Probe) {
        probe.id = ProbeUtils.getProbeId(probe);
    }

    static fillClientDefault(probe: Probe) {
        if (!probe.client) {
            probe.client = ConfigProvider.get<string>(ConfigNames.broker.client);
        }
    }

    static fillExpireSecsDefault(probe: Probe) {
        if (probe.expireSecs > 0) {
            probe.expireSecs = Math.min(probe.expireSecs, PROBE_MAX_EXPIRY_SECS);
        } else {
            probe.expireSecs = PROBE_DEFAULT_EXPIRY_SECS;
        }
    }

    static fillExpireCountDefault(probe: Probe) {
        if (probe.expireCount > 0) {
            probe.expireCount = Math.min(probe.expireCount, PROBE_MAX_EXPIRY_COUNT);
        } else {
            probe.expireCount = PROBE_DEFAULT_EXPIRY_COUNT;
        }
    }
}

