import { 
    Probe,
    ProbeType,
    SourceLocation,
} from "../../../../types";
import * as inspector from 'inspector';
import ProbeUtils from '../../../../utils/ProbeUtils';

export class Backchannel {
    private store: Map<number, { [key: string]: any }>;
    private index: number;
  
    constructor() {
      this.store = new Map();
      this.index = 0;
    }
  
    add() {
      this.index++;
  
      this.store.set(this.index, {});
  
      return this.index;
    }
  
    get(index: number) {
      return this.store.get(index);
    }
  
    delete(index: number) {
      this.store.delete(index);
    }
  
    clear() {
      this.store.clear();
    }
}

export const extractor = `(...arguments) => global.__sidekick_copy(arguments)`;

(process as any).__sidekick_backchannel = new Backchannel();

(global as any).__sidekick_copy = function copy([index, _this, ...scopes]: [index: number, _this: any, scopes: []]) {
  const backChannel = (process as any).__sidekick_backchannel.get(index);

  backChannel.this = _this;
  backChannel.scopes = scopes;
};

export default interface ProbeContext {
    getV8BreakpointId(): string;
    getLocationId(): string;
    getClient(): string;
    getFileName(): string;
    getLineNo(): number;
    getCondition(): string;
    getProbe(): Probe;
    getTags(): string[];
    getGeneratedPosition(): SourceLocation;
    getHitCount(): number;
    isExpired(): boolean;
    hit(): void;
}

export abstract class DefaultProbeContext implements ProbeContext {
    readonly probeId: string;
    readonly v8BreakpointId: inspector.Debugger.BreakpointId;
    readonly rawProbe: Probe;
    readonly locationId: string;
    readonly generatedPosition?: SourceLocation;
    protected createdAt: number;
    protected hitCount: number;
    protected expiredAt: number;
    protected expirable: boolean;

    constructor(
        v8BreakpointId: inspector.Debugger.BreakpointId,
        rawProbe: Probe,
        generatedPosition?: SourceLocation,
    ) {
        this.probeId = rawProbe.id;
        this.v8BreakpointId = v8BreakpointId;
        this.rawProbe = rawProbe;
        this.locationId = ProbeUtils.generateLocationId(rawProbe);
        this.generatedPosition = generatedPosition;
        this.createdAt = new Date().getTime();
        this.hitCount = 0;

        if (this.rawProbe.expireSecs) {
            this.expiredAt = this.createdAt + (this.rawProbe.expireSecs * 1000);
        }

        this.expirable = !(this.rawProbe.tags && this.rawProbe.tags.length);
    }

    getV8BreakpointId(): string {
        return this.v8BreakpointId;
    }

    getLocationId(): string {
        return this.locationId;
    }

    getClient(): string {
        return this.rawProbe.client;
    }

    getLineNo(): number {
        return this.generatedPosition ? this.generatedPosition.line : this.rawProbe.lineNo;
    }

    getFileName(): string {
        return this.generatedPosition ? this.generatedPosition.path : this.rawProbe.fileName;
    }

    getHitCount(): number {
        return this.hitCount;
    }

    hit(): void {
        this.hitCount++;
    }

    isExpired(): boolean {
        let result = false;
        if (this.expirable) {
            if (this.rawProbe.expireCount) {
                result = this.hitCount > this.rawProbe.expireCount
            }
    
            if (!result && this.expiredAt) {
                result = new Date().getTime() >= this.expiredAt;
            }
        }

        return result;
    }

    getGeneratedPosition(): SourceLocation {
        return this.generatedPosition;
    }

    getCondition(): string {
        return this.rawProbe.condition;
    }

    getProbe(): Probe {
        return this.rawProbe;
    }

    getTags(): string[] {
        return this.rawProbe.tags;
    }

    abstract getProbeAction(): ProbeType;
}