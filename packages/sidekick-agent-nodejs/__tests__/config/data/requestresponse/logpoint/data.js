const PutLogPointRequest = {
    id: '1',
    name: 'PutLogPointRequest',
    type: 'Request',
    client: 'test',
    logPointId: '18',
    fileName: 'breakpoint-method.js',
    lineNo: 4,
    fileHash: 'hash',
    expireCount: 5,
    action: 'Logpoint',
    logExpression: "Hello {{field1.item1}}",
    logLevel: 'INFO',
    stdoutEnabled: true,
};

const EnableLogPointRequest = {
    id: '2',
    name: 'EnableLogPointRequest',
    type: 'Request',
    client: 'test',
    logPointId: '18',
};

const DisableLogPointRequest = {
    id: '3',
    name: 'DisableLogPointRequest',
    type: 'Request',
    client: 'test',
    logPointId: '18',
};

const UpdateLogPointRequest = {
    id: '4',
    name: 'UpdateLogPointRequest',
    type: 'Request',
    client: 'test',
    logPointId: '18',
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
    PutLogPointRequest,
    EnableLogPointRequest,
    DisableLogPointRequest,
    UpdateLogPointRequest,
    EnableProbeTagRequest,
    DisableProbeTagRequest,
}