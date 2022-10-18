const GetConfigResponse = {
    id: '1',
    name: 'GetConfigResponse',
    type: 'Response',
    client: 'test',
    config: {
        maxProperties: 11,
    }
}

const UpdateConfigRequest = {
    id: '2',
    name: 'UpdateConfigRequest',
    type: 'Request',
    client: 'test',
    config: {
        maxProperties: 20,
    }
}

const AttachRequest = {
    id: '3',
    name: 'AttachRequest',
    type: 'Request',
    client: 'test',
}

const DetachRequest = {
    id: '4',
    name: 'DetachRequest',
    type: 'Request',
    client: 'test',
}

module.exports = {
    GetConfigResponse,
    UpdateConfigRequest,
    AttachRequest,
    DetachRequest,
}