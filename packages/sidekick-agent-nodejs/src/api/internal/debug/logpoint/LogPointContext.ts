import * as inspector from 'inspector';
import { Probe, ProbeActions, SourceLocation } from "../../../../types";
import { DefaultProbeContext } from "../probe/ProbeContext";

export default class LogPointContext extends DefaultProbeContext {
    constructor(
        v8BreakpointId: inspector.Debugger.BreakpointId,
        rawProbe: Probe,
        generatedPosition?: SourceLocation,
    ) {
        super(v8BreakpointId, rawProbe, generatedPosition);
    }

    getProbeAction(): ProbeActions {
        return 'Logpoint';
    }
}