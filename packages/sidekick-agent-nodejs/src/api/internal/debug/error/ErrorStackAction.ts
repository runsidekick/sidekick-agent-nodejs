import * as inspector from 'inspector';
import { 
  CaptureFrame,
  ErrorStackSnapshotEvent,
  ProbeType
} from '../../../../types';
import ScriptStore from '../../../../store/script/ScriptStore';
import V8InspectorApi from '../../v8/V8inspectorApi';
import CaptureProbeAction from '../probe/CaptureProbeAction';
import ErrorStackContext from './ErrorStackContext';
import Logger from '../../../../logger';
import { ConfigNames } from '../../../../config/ConfigNames';
import ConfigProvider from '../../../../config/ConfigProvider';
import CommunicationManager from '../../../external/communication/CommunicationManager';

export default class ErrorStackAction extends CaptureProbeAction<ErrorStackContext> {
  protected captureFrame: boolean;

  constructor(
    context: ErrorStackContext,
    scriptStore: ScriptStore,
    v8InspectorApi: V8InspectorApi
  ) {
    super(context, scriptStore, v8InspectorApi);

    this.captureFrame = ConfigProvider.get<boolean>(ConfigNames.errorCollection.captureFrame);
  }

  getType(): ProbeType {
    return 'ErrorStack';
  }

  onProbe(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>): void { 
    Logger.debug('<ErrorStackAction> Error stack probe action working ...');

    try {
      this.handleErrorStack(
        message, 
        this.captureFrame ? this.resolveFrames(message.params.callFrames): undefined);
    } catch (error) {
      Logger.debug(`<ErrorStackAction> An error occured while resolving frames ${error.message}`);
    }
  }

  protected handleErrorStack(
      message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>,
      frames: CaptureFrame[]) {
    setImmediate(() => {
      try {
        let fileName;
        let lineNo;
        let methodName;
        let convertedFrames;
        const { params } = message;
        const callFrame = params.callFrames[0];
        const currentDate = new Date().toISOString();
        if (frames) {
          const userFrames = this.prepareFrames(frames);
          if (!userFrames) {
            return;
          }
      
          convertedFrames = this.captureFrameConverter.convert(userFrames);
          ({ className: fileName, lineNo, methodName} = convertedFrames[0]);
        } else {
          ({ path: fileName, line: lineNo } = this.resolveLocation(callFrame));
          methodName = this.resolveFunctionName(callFrame);
        }

        let error = {} as Error;
        if (params.data) {
          const errorInfo = params.data as any;
          if (errorInfo) {
            error.name = errorInfo['className'];
            error.stack = errorInfo['description'];
            if (error.stack) {
              error.message = error.stack.substring(0, error.stack.indexOf("\n"))
            }
          }
        }

        const snapshotEvent = new ErrorStackSnapshotEvent(
          `${fileName}:${lineNo}:${currentDate}`,
          fileName,
          methodName,
          error,
          convertedFrames,
          fileName,
          lineNo,
        );
      
        CommunicationManager.sendEvent(snapshotEvent);
      } catch (error) {
        Logger.debug(`<ErrorStackAction> An error occured while handling error stack ${error.message}`); 
      }
    });
  }
}