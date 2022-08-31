import { DefaultTraceInfoResolver, TraceInfo } from "../TraceInfoResolver";
import Logger from '../../logger';

let thundra: any;
export default class ThundraTraceInfoResolver extends DefaultTraceInfoResolver {
    private static readonly THUNDRA_LIB = '@thundra/core';

    protected resolve(): void {
        try {
            if (this.state != 'NOTRESOLVED') {
                thundra = require(ThundraTraceInfoResolver.THUNDRA_LIB);
                this.state = 'RESOLVED';
                Logger.debug('<ThundraTraceInfoResolver> @thundra/core resolved.');
            }
        } catch (error) {
            this.state = this.state == undefined ? 'INITIATED' : 'NOTRESOLVED';
            Logger.debug('<ThundraTraceInfoResolver> @thundra/core did not resolved.');
        }
    }

    get(): TraceInfo {
        try {
            if (this.state == 'NOTRESOLVED') {
                return;
            } else if (this.state == 'INITIATED') {
                if (require.resolve(ThundraTraceInfoResolver.THUNDRA_LIB)) {
                    this.resolve();
                } else {
                    this.state = 'NOTRESOLVED';
                    return;
                }
            } 
             
            if (this.state == 'RESOLVED') {
                const tracer = thundra.tracer();
                if (tracer && tracer.getActiveSpan) {
                    const activeSpan = tracer.getActiveSpan();
                    if (activeSpan && activeSpan.spanContext) {
                        return {
                            traceId: activeSpan.spanContext.traceId,
                            spanId: activeSpan.spanContext.spanId,
                            transactionId: activeSpan.transactionId,
                        }
                    }
                }
            }  
        } catch (err) {
            Logger.debug(`<ThundraTraceInfoResolver> An error occured while obtaining thundra trace info. ${err.message}`);
        }
    }
}