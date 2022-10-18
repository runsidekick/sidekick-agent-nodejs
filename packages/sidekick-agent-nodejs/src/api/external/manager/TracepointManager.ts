import { BasePointItem, Probe, Tracepoint } from "../../../types";
import DebugApi from "../../../api/internal/debug/DebugApi";
import ProbeUtils from "../../../utils/ProbeUtils";
import * as ProbeErrors from "../../../error/ProbeErrors";
import Logger from "../../../logger";

export default interface TracepointManager {
    getAll(client?: string): Tracepoint[];
    putTracepoint(tracepoint: Tracepoint): void;
    updateTracePoint(tracepoint: Tracepoint): void;
    removeTracePoint(id: string, client: string): void;
    enableTracePoint(id: string, client: string): void;
    disableTracePoint(id: string, client: string): void;
}

export class DefaultTracepointManager implements TracepointManager {
    protected debugApi: DebugApi;

    constructor(debugApi: DebugApi){
        this.debugApi = debugApi;
    }

    getAll(client?: string) {
        const probes = this.debugApi.getAll();
        const tracepoints: Tracepoint[] = [];

        (probes || []).forEach(probe => {
            if (probe.type == 'Tracepoint') {
                const tracepoint = {
                    id: probe.rawId,
                    fileName: probe.remoteFilename || probe.fileName,
                    lineNo: probe.lineNo,
                    client: probe.client,
                    conditionExpression: probe.condition,
                    expireSecs: probe.expireSecs,
                    expireCount: probe.expireCount,
                    tracingEnabled: probe.tracingEnabled,
                    disabled: !probe.enabled,
                    fileHash: probe.fileHash,
                } as Tracepoint;
    
                if (client) {
                    if (probe.client === client) {
                        tracepoints.push(tracepoint)
                    }
                } else {
                    tracepoints.push(tracepoint);
                }
            }
        });

        return tracepoints;
    }

    putTracepoint(tracepoint: Tracepoint) {
        try {
            const probe = {
                ...tracepoint,
                rawId: tracepoint.id,
                fileName: ProbeUtils.extractFileName(tracepoint.fileName),
                remoteFilename: tracepoint.fileName,
                type: 'Tracepoint',
                enabled: !tracepoint.disable,
                tracingEnabled: tracepoint.tracingEnabled,
                ...( tracepoint.conditionExpression ? { condition: tracepoint.conditionExpression }: undefined ),
                actions: [
                    'ConditionAwareProbeAction',
                    'RateLimitedProbeAction',
                    ...( !tracepoint.tags ? ['ExpiringProbeAction'] : [] ),
                ],
            } as Probe;

            ProbeUtils.fillProbeId(probe);
            ProbeUtils.fillClientDefault(probe);
            ProbeUtils.fillExpireSecsDefault(probe);
            ProbeUtils.fillExpireCountDefault(probe);

            this.debugApi.add(probe);
        } catch (error) {
            Logger.debug(`<DefaultTracepointManager> An error occured while put tracepoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, tracepoint);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.PutProbeFailed.name, tracepoint, error.message);
            }

            throw codedError; 
        }
    }

    updateTracePoint(tracepoint: Tracepoint) {
        const probe = {
            ...tracepoint,
            rawId: tracepoint.id,
            type: 'Tracepoint',
            enabled: !tracepoint.disable,
            tracingEnabled: tracepoint.tracingEnabled,
            ...( tracepoint.conditionExpression ? { condition: tracepoint.conditionExpression }: undefined ),
            actions: [
                'ConditionAwareProbeAction',
                'RateLimitedProbeAction',
                ...( !tracepoint.tags ? ['ExpiringProbeAction'] : [] ),
            ],
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);
        ProbeUtils.fillExpireSecsDefault(probe);
        ProbeUtils.fillExpireCountDefault(probe);

        try {
            this.debugApi.update(probe);
        } catch (error) {
            Logger.debug(`<DefaultTracepointManager> An error occured while update tracepoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.UpdateProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }

    removeTracePoint(id: string, client: string) {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Tracepoint',
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.delete(probe);
        } catch (error) {
            Logger.debug(`<DefaultTracepointManager> An error occured while remove tracepoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.RemoveProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }

    enableTracePoint(id: string, client: string) {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Tracepoint',
        } as Probe;

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.enable(probe);
        } catch (error) {
            Logger.debug(`<DefaultTracepointManager> An error occured while enable tracepoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.EnableProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }
    
    disableTracePoint(id: string, client: string) {
        const probe = {
            id,
            rawId: id,
            client,
            type: 'Tracepoint',
        } as Probe

        ProbeUtils.fillProbeId(probe);
        ProbeUtils.fillClientDefault(probe);

        try {
            this.debugApi.disable(probe);
        } catch (error) {
            Logger.debug(`<DefaultTracepointManager> An error occured while disable tracepoint: ${error.message}`);
            let codedError = ProbeUtils.getCodedError(error, probe);
            if (!codedError) {
                codedError = ProbeUtils.getCodedErrorByName(ProbeErrors.DisableProbeWithIdFailed.name, probe, error.message);
            }

            throw codedError;
        }
    }
}