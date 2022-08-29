import * as inspector from 'inspector';
import V8InspectorApi from "../../v8/V8inspectorApi";
import ProbeAction, { DelegatedProbeAction } from "../probe/ProbeAction";
import ProbeContext from "../probe/ProbeContext";
import Logger from '../../../../logger';

export default class ConditionAwareProbeAction<C extends ProbeContext> extends DelegatedProbeAction<C> {
    protected v8InspectorApi?: V8InspectorApi;

    constructor(action: ProbeAction<C>, v8InspectorApi?: V8InspectorApi) {
        super(action);

        this.v8InspectorApi = v8InspectorApi;
    }

    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) {
        if (!this.checkCondition(message.params.callFrames[0])) {
            Logger.debug(`<ConditionAwareProbeAction> Condition did not valid.`);
            return;
        }
        
        super.onProbe(message);
    }

    private checkCondition(callFrame: inspector.Debugger.CallFrame): boolean {
        const context: C = this.getContext();   
        
        let checkResult = true;
        if (context != null) {
            const condition = context.getCondition();
            if (condition) {
                try {
                    const result = this.v8InspectorApi.evaluateOnCallFrame({
                        callFrameId: callFrame.callFrameId,
                        expression: condition,
                        returnByValue: true,
                        throwOnSideEffect: true,
                    });

                    if (result && result.response && result.response.result && 
                        result.response.result.subtype !== 'error' && result.response.result.value == false) {
                        checkResult = false;
                    }
                } catch (error) {
                    Logger.debug(`<ConditionAwareProbeAction> An error occured while evaluating condtion.`);
                    checkResult = false;
                }
            }
        }

        return checkResult;
    }
}