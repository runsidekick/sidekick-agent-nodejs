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

const TracePointErrors = {
    [ProbeAlreadyExistError.name]: {
        code: 2000,
        message: 'Tracepoint has been already added in file {fileName} on line {lineNo} from client {client}'
    },
    [NoProbeExistError.name]: {
        code: 2001,
        message: 'No tracepoint could be found in file {fileName} on line {lineNo} from client {client}'
    },
    [FileNameIsMandatory.name]: {
        code: 2002,
        message: 'File name is mandatory'
    },
    [LineNumberIsMandatory.name]: {
        code: 2003,
        message: 'Line number is mandatory'
    },
    [NoProbeExistWithId.name]: {
        code: 2004,
        message: 'No tracepoint could be found with id {id} from client {client}'
    },
    [ClientHasNoAccessToProbe.name]: {
        code: 2005,
        message: 'Client {client} has no access to tracepoint with id {id}'
    },
    [PutProbeFailed.name]: {
        code: 2050,
        message: 'Error occurred while putting tracepoint to file {fileName} on line {lineNo} from client {client}'
    },
    [SourceCodeMisMatchDetected.name]: {
        code: 2051,
        message: 'Source code mismatch detected while putting tracepoint to file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [UpdateProbeFailed.name]: {
        code: 2100,
        message: 'Error occurred while updating tracepoint at file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [UpdateProbeWithIdFailed.name]: {
        code: 2101,
        message: 'Error occurred while updating tracepoint with id {id} from client client {client} {reason}'
    },
    [RemoveProbeFailed.name]: {
        code: 2150,
        message: 'Error occurred while removing tracepoint from file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [RemoveProbeWithIdFailed.name]: {
        code: 2151,
        message: 'Error occurred while removing tracepoint with id {id} from client client {client} {reason}'
    },
    [EnableProbeFailed.name]: {
        code: 2200,
        message: 'Error occurred while enabling tracepoint at file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [EnableProbeWithIdFailed.name]: {
        code: 2201,
        message: 'Error occurred while enabling tracepoint with {id} from client client {client} {reason}'
    },
    [DisableProbeFailed.name]: {
        code: 2250,
        message: 'Error occurred while disabling tracepoint at file {fileName} on line {lineNo} from client {client} {reason}'
    },
    [DisableProbeWithIdFailed.name]: {
        code: 2251,
        message: 'Error occurred while disabling tracepoint with {id} from client client {client} {reason}'
    },
}

export default TracePointErrors;