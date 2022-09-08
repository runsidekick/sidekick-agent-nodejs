import * as inspector from 'inspector';
import { ProbeActions, TracePointSnapshotEvent, TracePointSnapshotFailedEvent, CaptureFrame } from '../../../../types';
import ScriptStore from '../../../../store/script/ScriptStore';
import V8InspectorApi from '../../v8/V8inspectorApi';
import CaptureProbeAction from '../probe/CaptureProbeAction';
import TracePointContext from "./TracePointContext";
import CommunicationManager from '../../../external/communication/CommunicationManager';
import UuidUtils from '../../../../utils/UuidUtils';
import ProbeUtils from '../../../../utils/ProbeUtils';
import Logger from '../../../../logger';
import * as TraceInfoSupport from '../../../../trace/TraceInfoSupport';
import { TraceInfo } from '../../../../trace/TraceInfoResolver';

export default class TracePointAction extends CaptureProbeAction<TracePointContext> {
  constructor(
    context: TracePointContext,
    scriptStore: ScriptStore,
    v8InspectorApi: V8InspectorApi
  ) {
    super(context, scriptStore, v8InspectorApi);
  }

  getType(): ProbeActions {
    return 'Tracepoint';
  }

  onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void {
    Logger.debug('<TracePointAction> Tracepoint probe action working ...');

    try {
      this.handleTracepoint(
        this.resolveFrames(message.params.callFrames),
        this.context.getProbe().tracingEnabled ? TraceInfoSupport.getTraceInfo(): undefined);
    } catch (error) {
      Logger.debug(`<TracePointAction> An error occured while resolving frames ${error.message}`);
      this.sendTracepointFailedEvent(error);
    }
  }

  protected handleTracepoint(frames: CaptureFrame[], traceInfo?: TraceInfo) {
    setImmediate(() => {
      try {
        const userFrames = this.prepareFrames(frames);
        if (!userFrames) {
          return;
        }

        const convertedFrames = this.captureFrameConverter.convert(userFrames);
        const snapshotEvent = new TracePointSnapshotEvent(
          this.context.rawProbe.id,
          this.context.rawProbe.client,
          this.context.rawProbe.remoteFilename || this.context.rawProbe.fileName,
          convertedFrames && convertedFrames[0] ? convertedFrames[0].methodName : '',
          convertedFrames,
          this.context.rawProbe.fileName,
          this.context.rawProbe.lineNo,
        );

        if (traceInfo) {
          Object.assign(snapshotEvent, traceInfo);
        }

        CommunicationManager.sendEvent(snapshotEvent);
      } catch (error) {
        Logger.debug(`<TracePointAction> An error occured while resolving frames ${error.message}`);
        this.sendTracepointFailedEvent(error);
      }
    });
  }

  protected sendTracepointFailedEvent(error: any) {
    setImmediate(() => {
      try {
        const snapshotFailedEvent = new TracePointSnapshotFailedEvent(
          UuidUtils.generateId(),
          this.context.rawProbe.client,
          this.context.rawProbe.remoteFilename || this.context.rawProbe.fileName,
          this.context.rawProbe.lineNo
        )
    
        let codedError = ProbeUtils.getCodedError(error, this.context.rawProbe);
        snapshotFailedEvent.setError(codedError || error)
        CommunicationManager.sendEvent(snapshotFailedEvent)
      } catch (error) {
        Logger.debug(`<TracePointAction> An error occured while sending tracepoint snapshot failed event ${error.message}`);
      }
    });
  }
}