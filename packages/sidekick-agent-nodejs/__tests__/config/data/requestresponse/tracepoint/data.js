const PutTracePointRequest = {
    id: '1',
    name: 'PutTracePointRequest',
    type: 'Request',
    client: 'test',
    tracePointId: '18',
    fileName:'breakpoint-method.js',
    lineNo: 4,
    fileHash: 'hash',
    expireCount: 3,
    action: 'Tracepoint',
};

const EnableTracePointRequest = {
    id: '2',
    name: 'EnableTracePointRequest',
    type: 'Request',
    client: 'test',
    tracePointId: '18',
};

const DisableTracePointRequest = {
    id: '3',
    name: 'DisableTracePointRequest',
    type: 'Request',
    client: 'test',
    tracePointId: '18',
};

const UpdateTracePointRequest = {
    id: '4',
    name: 'UpdateTracePointRequest',
    type: 'Request',
    client: 'test',
    tracePointId: '18',
    conditionExpression: 'a == "a"',
    expireSecs: 10000,
    expireCount: 3,
};

const EnableProbeTagRequest = {
    id: '5',
    name: 'EnableProbeTagRequest',
    type: 'Request',
    tag: 'tag1'
}

const DisableProbeTagRequest = {
    id: '6',
    name: 'DisableProbeTagRequest',
    type: 'Request',
    tag: 'tag1'
}

module.exports = {
    PutTracePointRequest,
    EnableTracePointRequest,
    DisableTracePointRequest,
    UpdateTracePointRequest,
    EnableProbeTagRequest,
    DisableProbeTagRequest,
}