import ThundraTraceInfoResolver from "./thundra/ThundraTraceInfoResolver";
import OpenTelemetryTraceInfoResolver from "./opentelemetry/OpenTelemetryTraceInfoResolver";
import TraceInfoResolver, { TraceInfo } from "./TraceInfoResolver";
import Logger from '../logger';

const Libs: { [key: string]: TraceInfoResolver } = {
    Thundra: new ThundraTraceInfoResolver(),
    OpenTelemetry: new OpenTelemetryTraceInfoResolver()
}

let loadedTraceInfo: TraceInfo;

export const loadTraceInfo = () => {
    for (const traceInfoResolver of Object.values(Libs)) {
        const traceInfo = traceInfoResolver.get();
        if (traceInfo) {
            Logger.debug('<TraceInfoSupport> Trace info loaded.');
            loadedTraceInfo = traceInfo;
            break;
        }
    }
}

export const getTraceInfo = (): TraceInfo => {
    return loadedTraceInfo;
}

(global as any).__sidekick_loadTraceInfo = (): boolean => {
    loadTraceInfo();
    return true;
}