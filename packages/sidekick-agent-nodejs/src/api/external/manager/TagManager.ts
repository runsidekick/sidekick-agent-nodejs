import DebugApi from "../../../api/internal/debug/DebugApi";

export default interface TagManager {
    enableTag(tag: string): void;
    disableTag(tag: string): void;
    removeTag(tag: string): void;
}

export class DefaultTagManager implements TagManager {
    protected debugApi: DebugApi;

    constructor(debugApi: DebugApi){
        this.debugApi = debugApi;
    }

    enableTag(tag: string): void {
        const probeIds = this.debugApi.getByTag(tag);
        (probeIds || []).forEach(probeId => {
            const probe = this.debugApi.get(probeId);
            this.debugApi.enable(probe);
        });
    }
    
    disableTag(tag: string): void {
        const probeIds = this.debugApi.getByTag(tag);
        (probeIds || []).forEach(probeId => {
            const probe = this.debugApi.get(probeId);
            this.debugApi.disable(probe);
        });
    }

    removeTag(tag: string): void {
        this.debugApi.removeTag(tag);
    }
}