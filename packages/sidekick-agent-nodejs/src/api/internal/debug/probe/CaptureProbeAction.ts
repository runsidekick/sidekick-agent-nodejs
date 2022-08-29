import * as inspector from 'inspector';
import { CaptureConfig, CaptureFrame } from '../../../../types';
import ScriptStore from "../../../../store/script/ScriptStore";
import V8InspectorApi from "../../v8/V8inspectorApi";
import { DefaultProbeAction } from "./ProbeAction";
import ProbeContext, { extractor } from "./ProbeContext";
import PathUtils from '../../../../utils/PathUtils';
import CaptureUtils from '../../../../utils/CaptureUtils';
import ConfigProvider from '../../../../config/ConfigProvider';
import { ConfigNames } from '../../../../config/ConfigNames';
import Logger from '../../../../logger';

class CaptureFramer {
  protected v8InspectorApi: V8InspectorApi;
  protected frame: inspector.Debugger.CallFrame;
  protected captureConfig: CaptureConfig;
  protected scopes: [];
  protected this: any;

  constructor(
    v8InspectorApi: V8InspectorApi,
    frame: inspector.Debugger.CallFrame,
    captureConfig: CaptureConfig) {
    this.v8InspectorApi = v8InspectorApi;
    this.frame = frame;
    this.captureConfig = captureConfig;
  }

  capture(): void {
    let index = (process as any).__sidekick_backchannel.add();

    try {
      let context = (process as any).__sidekick_backchannel.get(index);
      let scopeChain = this.frame.scopeChain;
      const callArguments: [{ [key: string]: any }] = [{
        value: index
      }];
  
      callArguments.push({
        objectId: this.frame.this.objectId
      });
  
      for (let scopeId = 0; scopeId < scopeChain.length; scopeId++) {
        let remoteScope = scopeChain[scopeId];
        let nextRemoteScope = scopeChain[scopeId + 1];
        let active = 
          remoteScope.type === 'local' 
          || remoteScope.type === 'catch' 
          || remoteScope.type === 'block' 
          || remoteScope.type === 'closure' 
          && (nextRemoteScope === undefined || nextRemoteScope.type !== 'global');
        if (!active) {
          continue;
        }

        callArguments.push({
          objectId: remoteScope.object.objectId
        });
      }
  
      let error = null;
      this.v8InspectorApi.post('Runtime.callFunctionOn', {
        objectId: scopeChain[0].object.objectId,
        functionDeclaration: extractor,
        arguments: callArguments,
        objectGroup: "backtrace"
      }, (err: any) => {
        error = err;
      });
  
      if (error !== null) {
        throw error;
      }
  
      this.scopes = context.scopes;
      this.this = context.this;
  
      if (this.this === global) {
        this.this = undefined;
      }
    } finally {
      (process as any).__sidekick_backchannel.delete(index);
    }
  }

  get(): { [key: string]: any } {
    let result: { [key: string]: any } = {};
    for (let i = 0; i < (this.scopes || []).length; i++) {
      if (i > this.captureConfig.maxProperties) {
        break;
      }

      const scope = this.scopes[i];
      for (const key of Object.keys(scope)) {
        if (result[key]) {
          /** todo: log */
          continue;
        }

        result[key] = scope[key];
      }
    }

    return result;
  }
}

export default abstract class CaptureProbeAction<C extends ProbeContext> extends DefaultProbeAction<C> {
  protected captureConfig: CaptureConfig;
  protected scriptStore: ScriptStore;
  protected v8InspectorApi: V8InspectorApi;
  protected captureFrameDataReductionCallback: (captureFrames: CaptureFrame[]) => CaptureFrame[] | undefined;

  constructor(      
    context: C,
    scriptStore: ScriptStore,
    v8InspectorApi: V8InspectorApi
  ){
    super(context, scriptStore, v8InspectorApi);

    this.captureConfig = {
      maxFrames: ConfigProvider.get<number>(ConfigNames.capture.maxFrames, 20),
      maxExpandFrames: ConfigProvider.get<number>(ConfigNames.capture.maxExpandFrames, 1),
      maxProperties: ConfigProvider.get<number>(ConfigNames.capture.maxProperties, 10),
      maxParseDepth: ConfigProvider.get<number>(ConfigNames.capture.maxParseDepth, 3),
    } as CaptureConfig;

    this.captureFrameDataReductionCallback = ConfigProvider.get<any>(ConfigNames.dataReduction.captureFrame);
  }

  protected prepareFrames(frames: CaptureFrame[]) {
    let capturedFrames = frames;
    if (this.captureFrameDataReductionCallback) {
      try {
        capturedFrames = this.captureFrameDataReductionCallback(frames);
      } catch (error) {
        Logger.debug(`<CaptureProbeAction> An error occured when calling captureFrameDataReductionCallback ${error.message}`);
      }
    }

    return capturedFrames;
  }

  protected resolveFrames(callFrames: inspector.Debugger.CallFrame[]): CaptureFrame[] {
    const frames: CaptureFrame[] = [];

    const frameCount = Math.min(
      callFrames.length,
      this.captureConfig.maxFrames
    );

    for (let i = 0; i < frameCount; i++) {
      const frame = callFrames[i];
      const fullPath = this.resolveFullPath(frame);
      if (CaptureUtils.shouldFramePathBeResolved(fullPath)) {
        frames.push(
          this.resolveFrame(frame, i < this.captureConfig.maxExpandFrames)
        );
      }
    }

    return frames;
  }
  
  protected resolveFrame(
    frame: inspector.Debugger.CallFrame,
    underFrameCap?: boolean
  ): CaptureFrame {
    let locals: { [key: string]: any } = {}
    if (underFrameCap) {
      const capturer = new CaptureFramer(this.v8InspectorApi, frame, this.captureConfig);
      capturer.capture();
      locals = capturer.get();
    }

    const resolvedLocation = this.resolveLocation(frame);
    const resolvedMethodName = this.resolveFunctionName(frame);

    return {
      capturedTime: new Date().toISOString(),
      className: resolvedLocation.path || '',
      lineNo: resolvedLocation.line,
      methodName: resolvedMethodName || '',
      locals,
    };
  }
  
  protected resolveFunctionName(frame: inspector.Debugger.CallFrame): string {
    if (!frame) {
      return '';
    }

    if (frame.functionName === '') {
      return '(anonymous function)';
    }

    return frame.functionName;
  }
  
  protected resolveLocation(frame: inspector.Debugger.CallFrame) {
    let path;
    const filePath = PathUtils.getRoutePath(frame.url.replace('file://', ''));
    const scriptWrapper = this.scriptStore.getByScriptUrl(filePath)
      || this.scriptStore.get(frame.location.scriptId);
    if (scriptWrapper && scriptWrapper.sourceFileInfoMap) {
      [path] = scriptWrapper.sourceFileInfoMap.values();
    }

    return {
      path: path ? path.rootPath : (scriptWrapper ? scriptWrapper.rawFileRelativePath: ''),
      line: frame.location.lineNumber,
    };
  }

  protected resolveFullPath(frame: inspector.Debugger.CallFrame): string {
    const scriptId = frame.location.scriptId;
    if (!this.scriptStore) {
      return '';
    }

    return this.scriptStore.getScriptRawFilePath(scriptId) || '';
  }
}