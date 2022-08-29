import { DefaultTraceInfoResolver, TraceInfo } from "../TraceInfoResolver";
import Logger from '../../logger';

let otel: any;
export default class OpenTelemetryTraceInfoResolver extends DefaultTraceInfoResolver {
    private static readonly OTEL_LIB = '@opentelemetry/api';

    protected resolve(): void {
        try {
            if (this.state !== 'NOTRESOLVED') {
                otel = require(OpenTelemetryTraceInfoResolver.OTEL_LIB);
                this.state = 'RESOLVED';
                Logger.debug('<OpenTelemetryTraceInfoResolver> @opentelemetry/api resolved.');
            }
        } catch (error) {
            this.state = this.state == undefined ? 'INITIATED' : 'NOTRESOLVED';
            Logger.debug('<OpenTelemetryTraceInfoResolver> @opentelemetry/api did not resolved.');
        }
    }

    get(): TraceInfo {
        try {
            if (this.state === 'NOTRESOLVED') {
                return;
            } else if (this.state === 'INITIATED') {
                if (require.resolve(OpenTelemetryTraceInfoResolver.OTEL_LIB)) {
                    this.resolve();
                } else {
                    this.state = 'NOTRESOLVED';
                    return;
                }
            } 
             
            if (this.state === 'RESOLVED') {
                const tracer = otel.trace;
                if (tracer && (otel.context.active)) {
                    let activeSpan = tracer.getSpan(otel.context.active());
                    if (activeSpan && activeSpan.spanContext) {
                        return {
                            traceId: activeSpan.spanContext().traceId,
                            spanId: activeSpan.spanContext().spanId,
                            transactionId: activeSpan.spanContext().traceId,
                        }
                    }
                }
            }  
        } catch (err) {
            Logger.debug(`<OpenTelemetryTraceInfoResolver> An error occured while obtaining opentelemetry trace info. ${err.message}`);
        }
    }
}