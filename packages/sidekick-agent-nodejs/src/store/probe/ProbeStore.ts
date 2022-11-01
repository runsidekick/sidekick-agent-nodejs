import ProbeAction from '../../api/internal/debug/probe/ProbeAction';
import ProbeContext from '../../api/internal/debug/probe/ProbeContext';
import { Probe } from '../../types';
import ProbeUtils from '../../utils/ProbeUtils';
import { ERROR_PROBE_STORE_ID } from '../../constants';

export default class ProbeStore {
    protected locationMap: Map<string, string>;
    protected breakpointProbeMap: Map<string, Set<string>>;
    protected probeMap: Map<string, ProbeAction<ProbeContext>>;
    protected tagProbeMap: Map<string, Set<string>>;

    constructor() {
        this.locationMap = new Map();
        this.breakpointProbeMap = new Map();
        this.probeMap = new Map();
        this.tagProbeMap = new Map();
    }

    getAllProbeContexts(): ProbeContext[] {
        const contexts: ProbeContext[] = [];
        for(const [key, value] of this.probeMap) {
            if (key === ERROR_PROBE_STORE_ID) {
                continue;
            }

            contexts.push(value.getContext());
        }

        return contexts;
    }

    getAllProbes(): Probe[] {
        const probes: Probe[] = [];
        for(const [key, value] of this.probeMap) {
            if (key === ERROR_PROBE_STORE_ID) {
                continue;
            }

            probes.push(value.getProbe());
        }

        return probes;
    }

    get(probeId: string): ProbeAction<ProbeContext> {
        return this.probeMap.get(probeId);
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

    getProbeByTag(tag: string): Set<string> {
        return this.tagProbeMap.get(tag);
    }

    set(v8BreakpointId: string, action: ProbeAction<ProbeContext>): boolean {
        const probeId = action.getId();
        const locationId = action.getLocationId();

        if (!this.breakpointProbeMap.has(v8BreakpointId)) {
            this.breakpointProbeMap.set(v8BreakpointId, new Set<string>());
            this.locationMap.set(locationId, v8BreakpointId);
        }

        this.breakpointProbeMap.get(v8BreakpointId).add(probeId);
        this.probeMap.set(probeId, action);

        (action.getContext().getTags() || []).forEach(tag => {
            if (!this.tagProbeMap.has(tag)) {
                this.tagProbeMap.set(tag, new Set<string>());
            }

            this.tagProbeMap.get(tag).add(probeId);
        });

        return true;
    }

    delete(probeId: string): void {
        if (this.probeMap.has(probeId)) {
            const probeAction = this.probeMap.get(probeId);
            const v8BreakpointId = probeAction.getV8BreakpointId();
            const probeRefs = this.breakpointProbeMap.get(v8BreakpointId);
            if (probeRefs) {
                probeRefs.delete(probeId);

                if (probeRefs.size == 0) {
                    this.breakpointProbeMap.delete(v8BreakpointId);
                    this.locationMap.delete(probeAction.getLocationId());
                }
            }

            (probeAction.getContext().getTags() || []).forEach(tag => {
                const probeTagRefs = this.tagProbeMap.get(tag);
                if (probeTagRefs) {
                    probeTagRefs.delete(probeId);
    
                    if (probeTagRefs.size == 0) {
                        this.tagProbeMap.delete(tag);

                    }
                }
            });

            this.probeMap.delete(probeId);
        }
    }

    deleteExpiredProbes() {
        this.probeMap.forEach((probeAction: ProbeAction<ProbeContext>) => {
            if (probeAction.getContext().isExpired()) {
                this.delete(probeAction.getId());
            }
        })
    }

    clear(): void {
        this.breakpointProbeMap.clear();
        this.locationMap.clear();
        this.probeMap.clear();
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