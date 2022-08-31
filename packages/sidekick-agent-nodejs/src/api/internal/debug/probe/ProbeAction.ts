import * as inspector from 'inspector';
import { 
    Probe,
    ProbeActions
} from '../../../../types';
import ProbeContext from "./ProbeContext";
import ScriptStore from "../../../../store/script/ScriptStore";
import V8InspectorApi from "../../v8/V8inspectorApi";

export default interface ProbeAction<C extends ProbeContext> {
    getId(): string;
    getV8BreakpointId(): string;
    getLocationId(): string;
    getProbe(): Probe;
    updateProbe(probe: Probe): void;
    getType(): ProbeActions;
    getClient(): string;
    getContext(): C;
    enable(): void;
    disable(): void;
    isDisabled(): boolean;
    isExpired(): boolean;
    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void;
}

export abstract class DefaultProbeAction<C extends ProbeContext> implements ProbeAction<C> {
    protected context: C;
    protected scriptStore: ScriptStore;
    protected v8InspectorApi: V8InspectorApi;

    constructor(
        context: C,
        scriptStore: ScriptStore,
        v8InspectorApi: V8InspectorApi
    ) {
        this.context = context;
        this.scriptStore = scriptStore;
        this.v8InspectorApi = v8InspectorApi;
    }

    getId(): string {
        return this.context.getProbe().id;
    }
    
    getV8BreakpointId(): string {
        return this.context.getV8BreakpointId();
    }

    getProbe(): Probe {
        return this.context.getProbe();
    }

    getLocationId(): string {
        return this.context.getLocationId();
    }

    getClient(): string {
        return this.context.getProbe().client;
    }

    getContext(): C {
        return this.context;
    }

    enable(): void {
        this.context.getProbe().enabled = true;
    }

    disable(): void {
        this.context.getProbe().enabled = false;
    }

    isDisabled(): boolean {
        return this.context.getProbe().enabled == false;
    }

    isExpired(): boolean {
        return this.context.isExpired();
    }

    updateProbe(probe: Probe): void {
        const rawProbe = this.context.getProbe();
        rawProbe.tracingEnabled = probe.tracingEnabled;
        if (probe.condition) {
          rawProbe.condition = probe.condition;
        } else if(rawProbe.condition) {
          rawProbe.condition = null;
        }
    
        if (probe.expireSecs) {
          rawProbe.expireSecs = probe.expireSecs;
        }
    
        if (probe.expireCount) {
          rawProbe.expireCount = probe.expireCount;
        }
    
        if (probe.enabled != null) {
          rawProbe.enabled = probe.enabled;
        }
    }

    abstract onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void;
    abstract getType(): ProbeActions;
}

export abstract class DelegatedProbeAction<C extends ProbeContext> implements ProbeAction<C> {
    private action: ProbeAction<C>;

    constructor(action: ProbeAction<C>) {
        this.action = action;
    }

    getId(): string {
        return this.action.getId();
    }

    getV8BreakpointId(): string {
        return this.action.getV8BreakpointId();
    }

    getLocationId(): string {
        return this.action.getLocationId(); 
    }

    getProbe(): Probe {
        return this.action.getProbe();
    }

    updateProbe(probe: Probe): void {
        this.action.updateProbe(probe);
    }

    getType(): ProbeActions {
        return this.action.getType(); 
    }

    getClient(): string {
        return this.action.getClient(); 
    }

    getContext(): C {
        return this.action.getContext();
    }

    enable(): void {
        return this.action.enable();
    }

    disable(): void {
        return this.action.disable();
    }

    isDisabled(): boolean {
       return this.action.isDisabled();
    }

    isExpired(): boolean {
        return this.action.isExpired();
    }

    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void {
        this.action.onProbe(message);
    }
}