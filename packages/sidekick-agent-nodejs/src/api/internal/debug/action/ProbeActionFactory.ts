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
import { ProbeActionType } from '../../../../types';

const actions: Record<ProbeActionType, <C extends ProbeContext>(delegatedAction: ProbeAction<C>) => ProbeAction<C>> = {
    'ConditionAwareProbeAction': (delegatedAction) => {
        return new ConditionAwareProbeAction(delegatedAction);
    },
    'RateLimitedProbeAction': (delegatedAction) => {
        return new RateLimitedProbeAction(
            delegatedAction,
            new DefaultRateLimiter(ConfigProvider.get<number>(ConfigNames.rateLimit.inMinute))
        );
    },
    'ErrorRateLimitedProbeAction': (delegatedAction) => {
        return new ErrorRateLimitedProbeAction(delegatedAction);
    },
    'ExpiringProbeAction': (delegatedAction) => {
        return new ExpiringProbeAction(delegatedAction);
    },
}

export default class ProbeActionFactory {
    static getAction(
        probeInfo: ProbeInfo,
        scriptStore: ScriptStore,
        v8InspectorApi: V8InspectorApi
    ): ProbeAction<ProbeContext> {
        let probeAction: ProbeAction<ProbeContext>;
        switch(probeInfo.probe.type) {
            case 'Tracepoint':
                probeAction = new TracePointAction(
                    new TracePointContext(
                        probeInfo.v8BreakpointId,
                        probeInfo.probe,
                        probeInfo.generatedPosition,
                    ), 
                    scriptStore, 
                    v8InspectorApi);

                break;
            case 'Logpoint':
                probeAction = new LogPointAction(
                    new LogPointContext(
                        probeInfo.v8BreakpointId,
                        probeInfo.probe,
                        probeInfo.generatedPosition,
                    ), 
                    scriptStore, 
                    v8InspectorApi);

                break;
            case 'ErrorStack':
                probeAction = new ErrorStackAction(
                    new ErrorStackContext(
                        probeInfo.v8BreakpointId,
                        probeInfo.probe,
                    ),
                    scriptStore, 
                    v8InspectorApi);

                break;
            default:
                return;
        }

        probeInfo.probe.actions.forEach(action => {
            const actionWrapper = actions[action];
            if (actionWrapper) {
                probeAction = actionWrapper(probeAction);
            }
        });

        return probeAction;
    }
}