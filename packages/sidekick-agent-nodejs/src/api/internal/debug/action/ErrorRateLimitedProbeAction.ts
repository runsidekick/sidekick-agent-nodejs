import * as inspector from 'inspector';
import ProbeAction, { DelegatedProbeAction } from "../probe/ProbeAction";
import ProbeContext from "../probe/ProbeContext";
import Logger from '../../../../logger';
import RateLimiter, { DefaultRateLimiter } from '../../../../limit/rate/RateLimiter';
import { ConfigNames } from "../../../../config/ConfigNames";
import ConfigProvider from "../../../../config/ConfigProvider";

import LRU from 'lru-cache';

export default class ErrorRateLimitedProbeAction<C extends ProbeContext> extends DelegatedProbeAction<C> {
    protected rateLimiterLruCache: LRU<string, RateLimiter>;
    protected inMinute: number;

    constructor(action: ProbeAction<C>, inMinute?: number) {
        super(action);
        
        this.rateLimiterLruCache = new LRU({
            max: 100, 
            maxSize: 100,
            ttl: 1000 * 60 * 5,
            allowStale: false,
            updateAgeOnGet: true,
            updateAgeOnHas: true,
            sizeCalculation: (value: RateLimiter, key: string) => {
              // return an positive integer which is the size of the item,
              // if a positive integer is not returned, will use 0 as the size.
              return 1;
            },
        });

        this.inMinute = inMinute || ConfigProvider.get<number>(ConfigNames.errorCollection.rateLimit.pointInMinute);
    }

    onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) {
        if (this.checkRateLimited(message)) {
            Logger.debug(`<ErrorRateLimitedProbeAction> Rate limit exceeded.`);
            return;
        }
        
        super.onProbe(message);
    }

    private checkRateLimited(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): boolean {
        const firstFrame = message.params.callFrames[0];
        const scriptLineIdentifier = `${firstFrame.location.scriptId}:${firstFrame.location.lineNumber}`;
        let rateLimiter = this.rateLimiterLruCache.get(scriptLineIdentifier);
        if (!rateLimiter) {
            rateLimiter = new DefaultRateLimiter(this.inMinute);
            this.rateLimiterLruCache.set(scriptLineIdentifier, rateLimiter);
        }
        
        return rateLimiter.checkRateLimit(new Date().getTime()) === 'EXCEEDED';
    }
}