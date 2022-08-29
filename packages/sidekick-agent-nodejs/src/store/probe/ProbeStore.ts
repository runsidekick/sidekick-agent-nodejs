import ProbeAction from '../../api/internal/debug/probe/ProbeAction';
import ProbeContext from '../../api/internal/debug/probe/ProbeContext';
import { Probe } from '../../types';
import ProbeUtils from '../../utils/ProbeUtils';
import { ERROR_PROBE_STORE_ID } from '../../constants';

export default class ProbeStore {
    protected locationMap: Map<string, string>;
    protected breakpointProbeMap: Map<string, Set<string>>;
    protected probes: Map<string, ProbeAction<ProbeContext>>;

    constructor() {
        this.locationMap = new Map();
        this.breakpointProbeMap = new Map();
        this.probes = new Map();
    }

    getAllProbeContexts(): ProbeContext[] {
        const contexts: ProbeContext[] = [];
        for(const [key, value] of this.probes) {
            if (key === ERROR_PROBE_STORE_ID) {
                continue;
            }

            contexts.push(value.getContext());
        }

        return contexts;
    }

    getAllProbes(): Probe[] {
        const probes: Probe[] = [];
        for(const [key, value] of this.probes) {
            if (key === ERROR_PROBE_STORE_ID) {
                continue;
            }

            probes.push(value.getProbe());
        }

        return probes;
    }

    get(probeId: string): ProbeAction<ProbeContext> {
        return this.probes.get(probeId);
    }

    getProbeIds(v8BreakpointId: string): Set<string> {
        return this.breakpointProbeMap.get(v8BreakpointId);
    }

    getProbeIdsByLocationId(locationId: string) {
        const v8BreakpointId = this.locationMap.get(locationId);
        if (!v8BreakpointId) { 
            return;
        }

        return this.breakpointProbeMap.get(v8BreakpointId);
    }

    set(v8BreakpointId: string, action: ProbeAction<ProbeContext>): boolean {
        const probeId = action.getId();
        const locationId = action.getLocationId();

        if (!this.breakpointProbeMap.has(v8BreakpointId)) {
            this.breakpointProbeMap.set(v8BreakpointId, new Set<string>());
            this.locationMap.set(locationId, v8BreakpointId);
        }

        this.breakpointProbeMap.get(v8BreakpointId).add(probeId);
        this.probes.set(probeId, action);
        return true;
    }

    delete(probeId: string): void {
        if (this.probes.has(probeId)) {
            const probeAction = this.probes.get(probeId);
            const v8BreakpointId = probeAction.getV8BreakpointId();
            const probeRefs = this.breakpointProbeMap.get(v8BreakpointId);
            if (probeRefs) {
                probeRefs.delete(probeId);

                if (probeRefs.size == 0) {
                    this.breakpointProbeMap.delete(v8BreakpointId);
                    this.locationMap.delete(probeAction.getLocationId());
                }
            }

            this.probes.delete(probeId);
        }
    }

    deleteExpiredProbes() {
        this.probes.forEach((probeAction: ProbeAction<ProbeContext>) => {
            if (probeAction.getContext().isExpired()) {
                this.delete(probeAction.getId());
            }
        })
    }

    clear(): void {
        this.breakpointProbeMap.clear();
        this.locationMap.clear();
        this.probes.clear();
    }

    isV8BreakpointExistOnLocation(probe: Probe): boolean {
        const locationId = ProbeUtils.generateLocationId(probe);
        return this.locationMap.has(locationId);
    }

    isV8BreakpointExist(v8BreakpointId: string) {
        return this.breakpointProbeMap.has(v8BreakpointId);
    }

    findV8Breakpoint(probe: Probe): string {
        const locationId = ProbeUtils.generateLocationId(probe);
        return this.locationMap.get(locationId);
    }
}