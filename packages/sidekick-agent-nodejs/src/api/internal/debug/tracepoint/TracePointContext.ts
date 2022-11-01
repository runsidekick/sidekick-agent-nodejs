import * as inspector from 'inspector';
import { 
    Probe,
    ProbeType,
    SourceLocation 
} from "../../../../types";
import { DefaultProbeContext } from "../probe/ProbeContext";

export default class TracePointContext extends DefaultProbeContext {
    constructor(
        v8BreakpointId: inspector.Debugger.BreakpointId,
        rawProbe: Probe,
        generatedPosition?: SourceLocation,
    ) {
        super(v8BreakpointId, rawProbe, generatedPosition);
    }

    getProbeAction(): ProbeType {
        return 'Tracepoint';
    }
}