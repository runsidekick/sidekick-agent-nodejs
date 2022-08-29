import ScriptStore from "../../../../store/script/ScriptStore";
import V8InspectorApi from "../../v8/V8inspectorApi";
import { ProbeInfo } from "../../../../types";
import ConditionAwareProbeAction from "./ConditionAwareProbeAction";
import TracePointAction from "../tracepoint/TracePointAction";
import TracePointContext from "../tracepoint/TracePointContext";
import ProbeAction from "../probe/ProbeAction";
import ProbeContext from "../probe/ProbeContext";
import ExpiringProbeAction from "./ExpiringProbeAction";
import RateLimitedProbeAction from "./RateLimitedProbeAction";
import LogPointAction from "../logpoint/LogPointAction";
import LogPointContext from "../logpoint/LogPointContext";
import ErrorStackAction from "../error/ErrorStackAction";
import ErrorStackContext from "../error/ErrorStackContext";
import { ConfigNames } from "../../../../config/ConfigNames";
import ConfigProvider from "../../../../config/ConfigProvider";
import { DefaultRateLimiter } from '../../../../limit/rate/RateLimiter';
import ErrorRateLimitedProbeAction from "./ErrorRateLimitedProbeAction";

export default class ProbeActionFactory {
    static getAction(
        probeInfo: ProbeInfo,
        scriptStore: ScriptStore,
        v8InspectorApi: V8InspectorApi
    ): ProbeAction<ProbeContext> {

        const inMinute = ConfigProvider.get<number>(ConfigNames.rateLimit.inMinute);
        switch(probeInfo.probe.action) {
            case 'Tracepoint':
                return new ConditionAwareProbeAction(
                    new RateLimitedProbeAction(
                        new ExpiringProbeAction(
                            new TracePointAction(
                                new TracePointContext(
                                    probeInfo.v8BreakpointId,
                                    probeInfo.probe,
                                    probeInfo.generatedPosition,
                                ), 
                                scriptStore, 
                                v8InspectorApi),
                        ),
                        new DefaultRateLimiter(inMinute)
                    ),
                    v8InspectorApi,
                );
            case 'Logpoint':
                return new ConditionAwareProbeAction(
                    new RateLimitedProbeAction(
                        new ExpiringProbeAction(
                            new LogPointAction(
                                new LogPointContext(
                                    probeInfo.v8BreakpointId,
                                    probeInfo.probe,
                                    probeInfo.generatedPosition,
                                ), 
                                scriptStore, 
                                v8InspectorApi),
                        ),
                        new DefaultRateLimiter(inMinute)
                    ),
                    v8InspectorApi,
                );
            case 'ErrorStack':
                return new ErrorRateLimitedProbeAction(
                    new ErrorStackAction(
                        new ErrorStackContext(
                            probeInfo.v8BreakpointId,
                            probeInfo.probe,
                        ),
                        scriptStore, 
                        v8InspectorApi)
                );
            default:
                return;
        }
    }
}