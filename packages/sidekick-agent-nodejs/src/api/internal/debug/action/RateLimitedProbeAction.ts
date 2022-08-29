import * as inspector from 'inspector';
import CommunicationManager from '../../../external/communication/CommunicationManager';
import RateLimiter from '../../../../limit/rate/RateLimiter';
import ProbeAction, { DelegatedProbeAction } from "../probe/ProbeAction";
import ProbeContext from "../probe/ProbeContext";
import { ProbeRateLimitEvent } from '../../../../types';
import UuidUtils from '../../../../utils/UuidUtils';
import Logger from '../../../../logger';

export default class RateLimitedProbeAction<C extends ProbeContext> extends DelegatedProbeAction<C> {
    protected rateLimiter: RateLimiter;

    constructor(action: ProbeAction<C>, rateLimiter: RateLimiter) {
        super(action);

        this.rateLimiter = rateLimiter;
    }

    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) {
        if (this.checkRateLimited()) {
            Logger.debug(`<RateLimitedProbeAction> Rate limit exceeded.`);
            return;
        }
        
        super.onProbe(message);
    }

    private checkRateLimited(): boolean {
        const rateLimitResult = this.rateLimiter.checkRateLimit(new Date().getTime());
        if (rateLimitResult === 'HIT') {
            Logger.debug(`<RateLimitedProbeAction> Rate limit hitted.`);

            const context: C = this.getContext();
            if (context) {
                CommunicationManager.sendEvent(
                    new ProbeRateLimitEvent(
                        UuidUtils.generateId(),
                        context.getFileName(),
                        context.getLineNo(),
                        context.getClient(),
                ));
            }

        }

        return rateLimitResult === 'EXCEEDED';
    }
}