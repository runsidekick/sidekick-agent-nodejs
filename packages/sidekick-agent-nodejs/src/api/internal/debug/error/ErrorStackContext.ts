import * as inspector from 'inspector';
import { 
    Probe,
    ProbeType
} from "../../../../types";
import { DefaultProbeContext } from "../probe/ProbeContext";

export default class ErrorPointContext extends DefaultProbeContext {
    constructor(
        v8BreakpointId: inspector.Debugger.BreakpointId,
        rawProbe: Probe,
    ) {
        super(v8BreakpointId, rawProbe);
    }

    getProbeAction(): ProbeType {
        return 'ErrorStack';
    }
}