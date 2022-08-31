import * as inspector from 'inspector';
import ProbeAction, { DelegatedProbeAction } from "../probe/ProbeAction";
import ProbeContext from "../probe/ProbeContext";
import Logger from '../../../../logger';

export default class ExpiringProbeAction<C extends ProbeContext> extends DelegatedProbeAction<C> {
    constructor(action: ProbeAction<C> ) {
        super(action);
    }

    isExpired(): boolean {
        const context: C = this.getContext();
        return context.isExpired();
    }

    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) {
        if (this.isExpired()) {
            Logger.debug(`<ExpiringProbeAction> Probe expired.`);
            return;
        }
        
        super.onProbe(message);
    }
}