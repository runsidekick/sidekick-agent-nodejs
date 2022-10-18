import DebugApi from "../../internal/debug/DebugApi";
import { Logpoint, Probe } from "../../../types";
import ProbeUtils from "../../../utils/ProbeUtils";
import * as ProbeErrors from "../../../error/ProbeErrors";
import Logger from "../../../logger";

export default interface LogpointManager {
    getAll(client?: string): Logpoint[];
    putLogpoint(logpoint: Logpoint): void;
    updateLogPoint(logpoint: Logpoint): void;
    removeLogPoint(id: string, client: string): void;
    enableLogPoint(id: string, client: string): void;
    disableLogPoint(id: string, client: string): void;
}

export class DefaultLogpointManager implements LogpointManager {
    protected debugApi: DebugApi;

    constructor(debugApi: DebugApi){
        this.debugApi = debugApi;
    }
    
    getAll(client?: string): Logpoint[] {
        const probes = this.debugApi.getAll();
        const logpoints: Logpoint[] = [];

        (probes || []).forEach(probe => {
            if (probe.type == 'Logpoint') {
                const logpoint = {
                    id: probe.rawId,
                    fileName: probe.remoteFilename || probe.fileName,
                    lineNo: probe.lineNo,
                    client: probe.client,
                    conditionExpression: probe.condition,
                    expireSecs: probe.expireSecs,
                    expireCount: probe.expireCount,
                    disabled: !probe.enabled,
                    fileHash: probe.fileHash,
                    logExpression: probe.logExpression,
                    logLevel: probe.logLevel,
                    stdoutEnabled: probe.stdoutEnabled
                } as Logpoint;
    
                if (client) {
                    if (probe.client === client) {
                        logpoints.push(logpoint)
                    }
                } else {
                    logpoints.push(logpoint);
                }
            }
        });

        return logpoints;
    }

    putLogpoint(logpoint: Logpoint): void {
        try {
            const probe = {
                ...logpoint,
                rawId: logpoint.id,
                fileName: ProbeUtils.extractFileName(logpoint.fileName),
                remoteFilename: logpoint.fileName,
                type: 'Logpoint',
                enabled: !logpoint.disable,
                ...( logpoint.conditionExpression ? { condition: logpoint.conditionExpression }: undefined ),
                actions: [
                    'ConditionAwareProbeAction',
                    'RateLimitedProbeAction',
                    ...( !logpoint.tags ? ['ExpiringProbeAction'] : [] ),
                ],
            } as Probe;

            ProbeUtils.fillProbeId(probe);
            ProbeUtils.fillClientDefault(probe);
            ProbeUtils.fillExpireSecsDefault(probe);
            ProbeUtils.fillExpireCountDefault(probe);

            this.debugApi.add(probe);
        } catch (error) {
            Logger.debug(`<DefaultLogpointManager> An error occured while put logpoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, logpoint);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.PutProbeFailed.name, logpoint, error.message);
            }

            throw codedError; 
        }
    }
    updateLogPoint(logpoint: Logpoint): void {
        const probe = {
            ...logpoint,
            rawId: logpoint.id,
            type: 'Logpoint',
            enabled: !logpoint.disable,
            ...( logpoint.conditionExpression ? { condition: logpoint.conditionExpression }: undefined ),
            actions: [
                'ConditionAwareProbeAction',
                'RateLimitedProbeAction',
                ...( !logpoint.tags ? ['ExpiringProbeAction'] : [] ),
            ],
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);
        ProbeUtils.fillExpireSecsDefault(probe);
        ProbeUtils.fillExpireCountDefault(probe);

        try {
            this.debugApi.update(probe);
        } catch (error) {
            Logger.debug(`<DefaultLogpointManager> An error occured while update logpoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.UpdateProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }
    removeLogPoint(id: string, client: string): void {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Logpoint',
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.delete(probe);
        } catch (error) {
            Logger.debug(`<DefaultLogpointManager> An error occured while remove logpoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.RemoveProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }
    enableLogPoint(id: string, client: string): void {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Logpoint',
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.enable(probe);
        } catch (error) {
            Logger.debug(`<DefaultLogpointManager> An error occured while enable logpoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.EnableProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }
    disableLogPoint(id: string, client: string): void {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Logpoint',
        } as Probe

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.disable(probe);
        } catch (error) {
            Logger.debug(`<DefaultLogpointManager> An error occured while disable logpoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.DisableProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    } 
}