import { 
    ProbeAlreadyExistError,
    NoProbeExistError,
    FileNameIsMandatory,
    ClientHasNoAccessToProbe,
    DisableProbeFailed,
    DisableProbeWithIdFailed,
    EnableProbeFailed,
    EnableProbeWithIdFailed,
    LineNumberIsMandatory,
    NoProbeExistWithId,
    PutProbeFailed,
    RemoveProbeFailed,
    RemoveProbeWithIdFailed,
    SourceCodeMisMatchDetected,
    UpdateProbeFailed,
    UpdateProbeWithIdFailed,
} from "../ProbeErrors";

const LogPointErrors = {
    [ProbeAlreadyExistError.name]: {
        code: 3000,
        message: 'Logpoint has been already added in file {} on line {} from client {}'
    },
    [NoProbeExistError.name]: {
        code: 3001,
        message: 'No logpoint could be found in file {} on line {} from client {}'
    },
    [FileNameIsMandatory.name]: {
        code: 3002,
        message: 'File name is mandatory'
    },
    [LineNumberIsMandatory.name]: {
        code: 3003,
        message: 'Line number is mandatory'
    },
    [NoProbeExistWithId.name]: {
        code: 3004,
        message: 'No logpoint could be found with id {} from client {}'
    },
    [ClientHasNoAccessToProbe.name]: {
        code: 3005,
        message: 'Client {} has no access to logpoint with id {}'
    },
    [PutProbeFailed.name]: {
        code: 3050,
        message: 'Error occurred while putting logpoint to file {} on line {} from client {}: {}'
    },
    [SourceCodeMisMatchDetected.name]: {
        code: 3051,
        message: 'Source code mismatch detected while putting logpoint to file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [UpdateProbeFailed.name]: {
        code: 3100,
        message: 'Error occurred while updating logpoint to file {} on line {} from client {}: {}'
    },
    [UpdateProbeWithIdFailed.name]: {
        code: 3101,
        message: 'Error occurred while updating logpoint with id {} from client {}: {}'
    },
    [RemoveProbeFailed.name]: {
        code: 3150,
        message: 'Error occurred while removing logpoint from file {} on line {} from client {}: {}'
    },
    [RemoveProbeWithIdFailed.name]: {
        code: 3151,
        message: 'Error occurred while removing logpoint with id {} from client {}: {}'
    },
    [EnableProbeFailed.name]: {
        code: 3200,
        message: 'Error occurred while enabling logpoint to file {} on line {} from client {}: {'
    },
    [EnableProbeWithIdFailed.name]: {
        code: 3201,
        message: 'Error occurred while enabling logpoint with id {} from client {}: {}'
    },
    [DisableProbeFailed.name]: {
        code: 3250,
        message: 'Error occurred while disabling logpoint to file {} on line {} from client {}: {}'
    },
    [DisableProbeWithIdFailed.name]: {
        code: 3251,
        message: 'Error occurred while disabling logpoint with id {} from client {}: {}'
    },
}

export default LogPointErrors;