export default interface TraceInfoResolver {
    get(): TraceInfo;
}

export abstract class DefaultTraceInfoResolver implements TraceInfoResolver {
    protected state: ResolverState;
    constructor() {
        this.resolve();
    }

    protected abstract resolve(): void;
    abstract get(): TraceInfo;
}

export type ResolverState = 
| 'INITIATED'
| 'RESOLVED'
| 'NOTRESOLVED'

export type TraceInfo = {
    traceId?: string;
    transactionId?: string;
    spanId?: string;
}