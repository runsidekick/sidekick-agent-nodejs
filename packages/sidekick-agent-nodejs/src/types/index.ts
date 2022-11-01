import { Debugger } from 'inspector';
import UuidUtils from '../utils/UuidUtils';
import CodedError from '../error/CodedError';

export type ConfigSchemaTypes = 'string' | 'number' | 'boolean' | 'map' | 'array' | 'function';

export type ConfigProviderModel<C extends BaseConfig, K extends BaseConfigMetaData<C | {}>> = {
  config?: C;
  configMetaData?: K;
} 

export type BaseConfig = {
  [propName: string]: any;
};

export type BaseConfigMetaData<T extends BaseConfig> = {
  [key: string]: {
    key: keyof T,
    type: ConfigSchemaTypes,
    required?: boolean,
    canEnv?: boolean,
    default?: any,
    flag?: string,
    description?: string,
    get?: (value: any) => any,
    validator?: (value: any) => boolean,
  };
}

export abstract class Message {
  type: string;
  name: string;
}

export class InternalMessage extends Message {
  data: any;
}

export type ProbeType = 
| 'Tracepoint'
| 'Logpoint'
| 'ErrorStack';

export type ProbeActionType = 
| 'ConditionAwareProbeAction'
| 'RateLimitedProbeAction'
| 'ErrorRateLimitedProbeAction'
| 'ExpiringProbeAction';

export type Probe = {
  id: string;
  rawId: string,
  fileName: string;
  lineNo: number;
  type: ProbeType;
  actions: ProbeActionType[],
  remoteFilename?: string;
  client?: string;
  condition?: string;
  expression?: string;
  expireSecs?: number;
  expireCount?: number;
  enabled?: boolean;
  tracingEnabled?: boolean;
  fileHash?: string;
  logExpression?: string;
  logLevel?: string;
  stdoutEnabled?: boolean
  tags?: string[];
}

export type ProbeInfo = {
  v8BreakpointId: string,
  probe: Probe,
  generatedPosition?: SourceLocation;
}

export type BasePointItem = {
  id: string;
  fileName?: string;
  lineNo?: number;
  client?: string;
  conditionExpression?: string;
  expireSecs?: number;
  expireCount?: number;
  disable?: boolean;
  fileHash?: string;
  tags?: string[],
}

export type Tracepoint = BasePointItem & {
  tracingEnabled?: boolean;
}

export type Logpoint = BasePointItem & {
  logExpression?: string;
  logLevel?: string;
  stdoutEnabled?: boolean;
}

export type CommunicationApiDataType = 
| 'Request' 
| 'Response'
| 'Event';

export abstract class CommunicationApiData extends Message {
  type: CommunicationApiDataType;
  client?: string;
}

export type TracePointRequestName =
| 'PutTracePointRequest' 
| 'EnableTracePointRequest' 
| 'DisableTracePointRequest' 
| 'RemoveBatchTracePointRequest' 
| 'RemoveTracePointRequest' 
| 'UpdateTracePointRequest'
| 'FilterTracePointsRequest'

export type LogPointRequestName =
| 'PutLogPointRequest' 
| 'EnableLogPointRequest' 
| 'DisableLogPointRequest' 
| 'RemoveBatchLogPointRequest' 
| 'RemoveLogPointRequest' 
| 'UpdateLogPointRequest'
| 'FilterLogPointsRequest';

export type TagRequestName = 
| 'EnableProbeTagRequest'
| 'DisableProbeTagRequest';

export type SilentRequestName = 
| 'AttachRequest'
| 'DetachRequest';

export type ConfigRequestName = 
| SilentRequestName 
| 'GetConfigRequest'
| 'UpdateConfigRequest';

export const SilentModeAcceptedRequestName: SilentRequestName[] = [
  'AttachRequest',
]

export type RequestName = 
| TracePointRequestName 
| LogPointRequestName 
| TagRequestName
| ConfigRequestName;

export class BrokerRequest extends CommunicationApiData {
  id: string;
  name: RequestName;

  constructor(id: string, client?: string) {
    super();

    this.type = 'Request';
    this.name = this.constructor.name as RequestName;
    this.id = id;
    this.client = client;
  }

  setName(name: RequestName) {
    this.name = name;
  }
}

export type ApplicationFilter = {
  name: string;
  version: string;
  stage: string;
  customTags: { [key: string]: any }
}

export class FilterTracePointsRequest extends BrokerRequest {
  applicationFilter: ApplicationFilter;

  constructor(
    applicationFilter: ApplicationFilter,
    id: string,
    client?: string) {
      super(id, client);
      this.setName('FilterTracePointsRequest');

      this.applicationFilter = applicationFilter;
    }
}

export type PutTracePointRequest = BrokerRequest & {
  tracePointId: string;
  fileName: string;
  className?: string;
  lineNo: number;
  conditionExpression?: string;
  expireSecs?: number;
  expireCount?: number;
  enableTracing?: boolean;
  fileHash?: string;
  disable: boolean;
};

export type UpdateTracePointRequest = BrokerRequest & {
  tracePointId: string;
  fileName: string;
  className?: string;
  lineNo: number;
  conditionExpression?: string;
  expireSecs?: number;
  expireCount?: number;
  enableTracing?: boolean;
  fileHash?: string;
  disable: boolean;
};

export type RemoveTracePointRequest = BrokerRequest & { 
  tracePointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export type RemoveBatchTracePointRequest = BrokerRequest & { 
  tracePointIds: string[];
}

export type EnableTracePointRequest = BrokerRequest & { 
  tracePointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export type DisableTracePointRequest = BrokerRequest & { 
  tracePointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export class FilterLogPointsRequest extends BrokerRequest {
  applicationFilter: ApplicationFilter;

  constructor(
    applicationFilter: ApplicationFilter,
    id: string,
    client?: string) {
      super(id, client);
      this.setName('FilterLogPointsRequest');

      this.applicationFilter = applicationFilter;
    }
}

export type PutLogPointRequest = BrokerRequest & { 
  logPointId: string;
  fileName: string;
  lineNo: number;
  logExpression: string;
  fileHash: string;
  conditionExpression: string;
  expireSecs: number;
  expireCount: number;
  stdoutEnabled: boolean;
  logLevel: string;
  disable: boolean;
}

export type UpdateLogPointRequest = BrokerRequest & {
  logPointId: string;
  fileName: string;
  lineNo: number;
  logExpression: string;
  fileHash: string;
  conditionExpression: string;
  expireSecs: number;
  expireCount: number;
  stdoutEnabled: boolean;
  logLevel: string;
  disable: boolean;
};

export type RemoveLogPointRequest = BrokerRequest & { 
  logPointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export type RemoveBatchLogPointRequest = BrokerRequest & { 
  logPointIds: string[];
}

export type EnableLogPointRequest = BrokerRequest & { 
  logPointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export type DisableLogPointRequest = BrokerRequest & { 
  logPointId: string;
  fileName: string;
  className: string;
  lineNo: number;
}

export type EnableProbeTagRequest = BrokerRequest & { 
  tag: string;
}

export type DisableProbeTagRequest = BrokerRequest & { 
  tag: string;
}

export class GetConfigRequest extends BrokerRequest {
  constructor(
    id: string,
    client?: string) {
    super(id, client);
    this.setName('GetConfigRequest');
  }
}

export type UpdateConfigRequest = BrokerRequest & { 
  config: { [key: string]: any }
}

export type AttachRequest = BrokerRequest & { 
}

export type DetachRequest = BrokerRequest & { 
}

export type TracePointResponseName =
| 'FilterTracePointsResponse'
| 'PutTracePointResponse'
| 'UpdateTracePointResponse'
| 'RemoveTracePointResponse'
| 'RemoveBatchTracePointResponse'
| 'EnableTracePointResponse'
| 'DisableTracePointResponse';

export type LogPointResponseName =
| 'FilterLogPointsResponse'
| 'PutLogPointResponse'
| 'UpdateLogPointResponse'
| 'RemoveLogPointResponse'
| 'RemoveBatchLogPointResponse'
| 'EnableLogPointResponse'
| 'DisableLogPointResponse';

export type TagResponseName = 
| 'EnableProbeTagResponse'
| 'DisableProbeTagResponse';

export type ConfigResponseName = 
| 'GetConfigResponse'
| 'UpdateConfigResponse'
| 'AttachResponse'
| 'DetachResponse';

export type ResponseName =
| TracePointResponseName 
| LogPointResponseName 
| TagResponseName
| ConfigResponseName;

export class BrokerResponse extends CommunicationApiData {
  name: ResponseName;
  source: string;
  runtime: string;
  agentVersion: string;
  requestId: string;
  applicationName: string;
  applicationInstanceId: string;
  erroneous?: boolean;
  errorCode?: number;
  errorMessage?: string;

  constructor(
    name: ResponseName,
    requestId: string,
    client: string,
  ){
    super();

    this.requestId = requestId;
    this.name = name;
    this.client = client;
    this.type = 'Response';
    this.source = 'Agent';
    this.runtime = `NodeJS-${process.version}`;
    this.agentVersion = '';
    this.erroneous = false;
    this.errorCode = 0;
  }

  setError(error: Error) {
    this.erroneous = true;
    this.errorCode =
            error instanceof CodedError
                    ? (error as CodedError).code
                    : 0;
    this.errorMessage = error.message;
  }
}

export class FilterTracePointsResponse  extends BrokerResponse  {
  tracePoints: Tracepoint[];

  constructor(tracePoints: Tracepoint[], requestId: string, client?: string) {
    super('FilterTracePointsResponse', requestId, client);

    this.tracePoints = tracePoints;
  }
}

export class PutTracePointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('PutTracePointResponse', requestId, client);
  }
}

export class UpdateTracePointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('UpdateTracePointResponse', requestId, client);
  }
}

export class RemoveTracePointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('RemoveTracePointResponse', requestId, client);
  }
}

export class RemoveBatchTracePointResponse extends BrokerResponse {
  removedTracePointIds: string[];
  unRemovedTracePointIds: { [key:string]: string };

  constructor(requestId: string, client: string){
    super('RemoveBatchTracePointResponse', requestId, client);

    this.removedTracePointIds = [];
    this.unRemovedTracePointIds = {};
  }
}

export class EnableTracePointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('EnableTracePointResponse', requestId, client);
  }
}

export class DisableTracePointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('DisableTracePointResponse', requestId, client);
  }
}

export class FilterLogPointsResponse  extends BrokerResponse  {
  logPoints: Logpoint[];

  constructor(logPoints: Logpoint[], requestId: string, client?: string) {
    super('FilterLogPointsResponse', requestId, client);

    this.logPoints = logPoints;
  }
}

export class PutLogPointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('PutLogPointResponse', requestId, client);
  }
}

export class UpdateLogPointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('UpdateLogPointResponse', requestId, client);
  }
}

export class RemoveLogPointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('RemoveLogPointResponse', requestId, client);
  }
}

export class RemoveBatchLogPointResponse extends BrokerResponse {
  removedLogPointIds: string[];
  unRemovedLogPointIds: { [key:string]: string };

  constructor(requestId: string, client: string){
    super('RemoveBatchLogPointResponse', requestId, client);

    this.removedLogPointIds = [];
    this.unRemovedLogPointIds = {};
  }
}

export class EnableLogPointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('EnableLogPointResponse', requestId, client);
  }
}

export class DisableLogPointResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('DisableLogPointResponse', requestId, client);
  }
}

export class EnableProbeTagResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('EnableProbeTagResponse', requestId, client);
  }
}

export class DisableProbeTagResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('DisableProbeTagResponse', requestId, client);
  }
}

export class GetConfigResponse extends BrokerResponse {
  config: { [key: string]: any}

  constructor(requestId: string, client: string){
    super('GetConfigResponse', requestId, client);
  }
}

export class UpdateConfigResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('UpdateConfigResponse', requestId, client);
  }
}

export class AttachResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('AttachResponse', requestId, client);
  }
}

export class DetachResponse extends BrokerResponse {
  constructor(requestId: string, client: string){
    super('DetachResponse', requestId, client);
  }
}

export type GenerelEventName =
| 'ProbeRateLimitEvent'
| 'ApplicationStatusEvent';

export type TracePointEventName = 
| 'TracePointSnapshotEvent'
| 'TracePointSnapshotFailedEvent';


export type ErrorStackEventName = 
| 'ErrorStackSnapshotEvent';

export type LogPointEventName = 
| 'LogPointEvent'
| 'LogPointFailedEvent';


export class BrokerEvent extends CommunicationApiData {
  id: string;
  name: GenerelEventName | TracePointEventName | LogPointEventName | ErrorStackEventName | string;
  sendAck?: boolean;
  time?: number;
  hostName?: string;
  applicationName?: string;
  applicationInstanceId?: string;

  constructor(
    name: GenerelEventName | TracePointEventName | LogPointEventName | ErrorStackEventName,
    sendAck = false, 
    id?: string, 
    client?: string) {
    super()

    this.id = id || UuidUtils.generateId();
    this.name = name;
    this.sendAck = sendAck;
    this.client = client;
    this.type = 'Event';
  }
}

export class SnapshotEvent extends BrokerEvent {
  fileName: string;
  className?: string;
  lineNo: number;
  methodName: string;
  frames: Frame[];
  traceId?: string;
  transactionId?: string;
  spanId?: string;

  constructor(
    name: TracePointEventName | LogPointEventName | ErrorStackEventName,
    client: string,
    fileName: string, 
    methodName: string,
    frames: Frame[],
    className?: string, 
    lineNo?: number,
    sendAck = false,
    traceId?: string,
    transactionId?: string,
    spanId?: string) {
      super(name, sendAck, UuidUtils.generateId(), client);

      this.fileName = fileName;
      this.className = className;
      this.lineNo = lineNo;
      this.methodName = methodName;
      this.frames = frames;
      this.traceId = traceId;
      this.transactionId = transactionId;
      this.spanId = spanId;
  }
}

export class TracePointSnapshotEvent extends SnapshotEvent {
  tracePointId: string;

  constructor(
    tracePointId: string, 
    client: string,
    fileName: string, 
    methodName: string,
    frames: Frame[],
    className?: string, 
    lineNo?: number,
    sendAck = false,
    traceId?: string,
    transactionId?: string,
    spanId?: string) {
      super('TracePointSnapshotEvent', client, fileName, methodName, frames,
        className, lineNo, sendAck, traceId, transactionId, spanId);

      this.tracePointId = tracePointId;
  }
}

export class TracePointSnapshotFailedEvent extends BrokerEvent {
  className?: string;
  lineNo?: number;
  errorCode?: number;
  errorMessage?: string;

  constructor(id?: string, client?: string, className?: string, lineNo?: number, sendAck = false) {
    super('TracePointSnapshotFailedEvent', sendAck, id, client);

    this.className = className;
    this.lineNo = lineNo;
    this.errorCode = 0;
    this.errorMessage = '';
  }

  setError(error: Error) {
    this.errorCode =
            error instanceof CodedError
                    ? (error as CodedError).code
                    : 0;
    this.errorMessage = error.message;
  }
}

export class ErrorStackSnapshotEvent extends SnapshotEvent {
  errorStackId: string;
  error: Error;

  constructor(
    errorStackId: string, 
    fileName: string, 
    methodName: string,
    error: Error,
    frames?: Frame[],
    className?: string, 
    lineNo?: number,
    sendAck = false,
    traceId?: string,
    transactionId?: string,
    spanId?: string) {
      super('ErrorStackSnapshotEvent', undefined, fileName, methodName, frames,
        className, lineNo, sendAck, traceId, transactionId, spanId);

      this.errorStackId = errorStackId;
      this.error = error;
  }
}

export class ApplicationStatusEvent extends BrokerEvent {
  application: ApplicationStatus;

  constructor(id: string, application: ApplicationStatus, client?: string, sendAck = false){
    super('ApplicationStatusEvent', sendAck, id, client);

    this.application = application;
  }
}

export class LogPointEvent extends BrokerEvent {
  logPointId: string;
  fileName: string;
  className?: string;
  lineNo: number;
  methodName: string;
  logMessage: string;
  createdAt: string;

  constructor(
    logPointId: string, 
    client: string,
    fileName: string, 
    methodName: string,
    className?: string, 
    lineNo?: number,
    logMessage?: string,
    createdAt?: string,
    sendAck = false) {
      super('LogPointEvent', sendAck, UuidUtils.generateId(), client);

      this.logPointId = logPointId;
      this.fileName = fileName;
      this.className = className;
      this.lineNo = lineNo;
      this.methodName = methodName;
      this.logMessage = logMessage;
      this.createdAt = createdAt;
  }
}

export class LogPointFailedEvent extends BrokerEvent {
  className?: string;
  lineNo?: number;
  errorCode?: number;
  errorMessage?: string;

  constructor(id?: string, client?: string, className?: string, lineNo?: number, sendAck = false) {
    super('LogPointFailedEvent', sendAck, id, client);

    this.className = className;
    this.lineNo = lineNo;
    this.errorCode = 0;
    this.errorMessage = '';
  }

  setError(error: Error) {
    this.errorCode =
            error instanceof CodedError
                    ? (error as CodedError).code
                    : 0;
    this.errorMessage = error.message;
  }
}

export type ApplicationStatus = {
  instanceId: string;
  name: string;
  stage: string;
  version: string;
  ip?: string;
  hostName: string;
  runtime: string;
  customTags?: CustomTag[];
  tracePoints: Tracepoint[];
  logPoints: Tracepoint[];
  [key: string]: any;
}

export type CustomTag = {
  tagName: string;
  tagValue: string;
}

export class ProbeRateLimitEvent extends BrokerEvent {
  className: string;
  lineNo: number;

  constructor(id: string, className: string, lineNo: number, client?: string, sendAck = false) {
    super('ProbeRateLimitEvent', sendAck, id, client);

    this.className = className;
    this.lineNo = lineNo;
  }
}

export type Frame = {
  className?: string;
  methodName?: string;
  lineNo?: number;
  variables?: { [key: string]: Variable };
}

export type Variable = {
  '@array'?: boolean;
  '@name'?: string;
  '@type': string;
  '@value': any;
}

export type CaptureFrame = {
  className?: string;
  methodName?: string;
  lineNo?: number;
  capturedTime: string,
  locals : { [key: string]: any }
}

export type SourceLocation = {
  path?: string;
  column?: number;
  line: number;
  lastColumn?: number;
}

export type LoadedScriptInfo = {
  scriptParams: Debugger.ScriptParsedEventDataType;
  scriptRawUrl: string;
  scriptSource: string;
}

export type SourceFileInfo = {
  rootPath: string;
  rawPath: string;
  sourceFile: string;
}

export type ScriptInfo = SourceFileInfo & {
  scriptId: string;
}

export type CaptureConfig = {
  maxFrames: number;
  maxExpandFrames: number;
  maxProperties: number;
  maxParseDepth: number;
  propertyAccessClassification: PropertyAccessClassification;
  minified: boolean;
}

export type LogMessageDataReductionInfo = {
  logExpression: string,
  logMessage: string,
  lineNo: number,
  fileName: string,
  methodName: string,
}

export type RateLimitResult = 
| 'OK'
| 'HIT'
| 'EXCEEDED';

export type PropertyAccessClassification = 
| 'ENUMERABLE-OWN'
| 'ENUMERABLE-OWN-AND-ENUMERABLE-PARENT'
| 'ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN'
| 'ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN-ENUMERABLE-PARENT';
