import * as inspector from 'inspector';
import CaptureProbeAction from "../probe/CaptureProbeAction";
import LogPointContext from "./LogPointContext";
import ScriptStore from '../../../../store/script/ScriptStore';
import V8InspectorApi from '../../v8/V8inspectorApi';
import Logger from '../../../../logger';
import MustacheExpressionUtils from '../../../../utils/MustacheExpressionUtils';
import {
  Probe,
  ProbeActions,
  LogPointEvent,
  LogPointFailedEvent,
  LogMessageDataReductionInfo,
  CaptureFrame
} from '../../../../types';
import CommunicationManager from '../../../external/communication/CommunicationManager';
import UuidUtils from '../../../../utils/UuidUtils';
import ProbeUtils from '../../../../utils/ProbeUtils';
import ConfigProvider from '../../../../config/ConfigProvider';
import { ConfigNames } from '../../../../config/ConfigNames';

export default class LogPointAction extends CaptureProbeAction<LogPointContext> {
  protected logMessageDataReductionCallback?: (
    logMessageDataReductionInfo: LogMessageDataReductionInfo,
    locals: { [key: string]: any },
    ) => string | undefined;
    
  constructor(
    context: LogPointContext,
    scriptStore: ScriptStore,
    v8InspectorApi: V8InspectorApi
  ) {
    super(context, scriptStore, v8InspectorApi);

    this.captureConfig.maxFrames = 1;
    this.logMessageDataReductionCallback = ConfigProvider.get<any>(ConfigNames.dataReduction.logMessage);
  }

  onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void {
    Logger.debug('<LogPointAction> Logpoint probe action working ...');

    let resolvedFrames: CaptureFrame[];
    try {
      resolvedFrames = this.resolveFrames(message.params.callFrames);
    } catch (error) {
      Logger.debug(`<LogPointAction> An error occured while resolving frames ${error.message}`);
      this.sendLogpointFailedEvent(error);
      return;
    }

    const {
      logLevel,
      stdoutEnabled,
    } = this.context.getProbe();
    if (stdoutEnabled && logLevel) { 
      try {
        /** flow must be continue sync */
        const frames = this.prepareFrames(resolvedFrames);
        frames.length
        if (!frames || !frames.length) {
          return;
        }
        
        const firstFrame = frames[0];
        const logMessage = this.prepareLogMessage(firstFrame);
        if (!logMessage) {
          return;
        }
    
        this.writeLogMessageToConsole(logMessage, firstFrame.capturedTime);
        setImmediate(() => {
          this.sendLogpointEvent(firstFrame, logMessage);  
        }); 
      } catch (error) {
        Logger.debug(`<LogPointAction> An error occured while preparing log message ${error.message}`);
        this.sendLogpointFailedEvent(error);
      }
    } else {
      /** flow can be continue async */
      setImmediate(() => {
        try {
          const frames = this.prepareFrames(resolvedFrames);
          if (!frames) {
            return;
          }
  
          const firstFrame = frames[0];
          const logMessage = this.prepareLogMessage(firstFrame);
          if (!logMessage) {
            return;
          }
  
          this.sendLogpointEvent(firstFrame, logMessage);
        } catch (error) {
          Logger.debug(`<LogPointAction> An error occured while preparing log message ${error.message}`);
          this.sendLogpointFailedEvent(error);
        }
      });
    }
  }

  updateProbe(probe: Probe): void {
    const rawProbe = this.context.getProbe();
    if (probe.logExpression) {
      rawProbe.logExpression = probe.logExpression;
    }

    if (probe.logLevel) {
      rawProbe.logLevel = probe.logLevel;
    }

    if (probe.stdoutEnabled != null) {
      rawProbe.stdoutEnabled = probe.stdoutEnabled;
    }

    super.updateProbe(probe);
  }

  getType(): ProbeActions {
      return 'Logpoint';
  }

  protected sendLogpointEvent(frame: CaptureFrame, logMessage: string) {
    try {
      const {
        id,
        client,
        fileName,
        lineNo,
        remoteFilename,
      } = this.context.getProbe();
  
      const logPointEvent = new LogPointEvent(
        id.replace(`${this.context.rawProbe.action}:`, ''),
        client,
        remoteFilename || fileName,
        frame.methodName,
        fileName,
        lineNo,
        logMessage,
        frame.capturedTime,
      );
  
      CommunicationManager.sendEvent(logPointEvent);
    } catch (error) {
      this.sendLogpointFailedEvent(error);
    }
  }

  protected sendLogpointFailedEvent(error: any) {
    setImmediate(() => {
      try {
        const logPointFailedEvent = new LogPointFailedEvent(
          UuidUtils.generateId(),
          this.context.rawProbe.client,
          this.context.rawProbe.remoteFilename || this.context.rawProbe.fileName,
          this.context.rawProbe.lineNo
        )
    
        let codedError = ProbeUtils.getCodedError(error, this.context.rawProbe);
        logPointFailedEvent.setError(codedError || error)
        CommunicationManager.sendEvent(logPointFailedEvent);
      } catch (error) {
        Logger.debug(`<LogPointAction> An error occured while sending log point failed event ${error.message}`);
      }
    });
  }

  protected prepareLogMessage(frame: CaptureFrame): string | undefined{
    const { logExpression } = this.context.getProbe();
    if (!logExpression) {
      return;
    }

    const { locals } = frame;
    let logMessage = MustacheExpressionUtils.render(logExpression, locals);
    if (this.logMessageDataReductionCallback) { 
      logMessage = this.logMessageDataReductionCallback({
        fileName: this.context.getFileName(),
        lineNo: this.context.getLineNo(),
        logExpression,
        logMessage,
        methodName: frame.methodName},
        locals);
    }

    return logMessage;
  }

  protected writeLogMessageToConsole(logMessage: string, logTime = new Date().toISOString()): void {
    const {
      logLevel,
      stdoutEnabled,
    } = this.context.getProbe();


    if (stdoutEnabled && logLevel && logMessage) {
      /**
       * don't use logger intance for log level mismatch
       * use stdout for log in every way
       */
        process.stdout.write(`\n ${logTime} [${logLevel.toLocaleUpperCase()}] ${logMessage} \n`);
    }
  }
}