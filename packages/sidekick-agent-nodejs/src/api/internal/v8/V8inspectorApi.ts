import * as inspector from 'inspector';
import { Api } from '../../Api';

export default interface V8InspectorApi extends Api {
  setSession(session: inspector.Session): void;
  post(messageId: any, params: any, cb?: any): void;
  setBreakpointByUrl(options: inspector.Debugger.SetBreakpointByUrlParameterType)
  : { error?: Error, response?: inspector.Debugger.SetBreakpointByUrlReturnType };
  removeBreakpoint(breakpointId: string): { error?: Error };
  updateBreakpointByUrl(breakpointId: string, options: inspector.Debugger.SetBreakpointByUrlParameterType)
  : { error?: Error, response?: inspector.Debugger.SetBreakpointByUrlReturnType }
  | { error?: Error };
  evaluateOnCallFrame(
    options: inspector.Debugger.EvaluateOnCallFrameParameterType
  ): any;
  getProperties(options: inspector.Runtime.GetPropertiesParameterType)
  : { error?: Error, response?: inspector.Runtime.GetPropertiesReturnType };
}

export class DefaultV8InspectorApi implements V8InspectorApi {
  session: inspector.Session;
  constructor(session: inspector.Session) {
    this.session = session;
  }

  setSession(session: inspector.Session): void {
    this.session = session;
  }

  post(messageId: any, params: any, cb?: any) {
    const myCb = (...args: any[]) => {
      if (cb !== undefined) {
        cb(...args);
      }
    };

    if (this.session === null) {
      if (cb !== undefined) {
        cb(new Error("No debug session"), null);
      }

      return;
    }

    this.session.post(messageId, params, myCb);
  }

  setBreakpointByUrl(
    options: inspector.Debugger.SetBreakpointByUrlParameterType
  ) {
    const result: {
      error?: Error;
      response?: inspector.Debugger.SetBreakpointByUrlReturnType;
    } = {};

    this.post(
      'Debugger.setBreakpointByUrl',
      options,
      (
        error: Error | null,
        response: inspector.Debugger.SetBreakpointByUrlReturnType
      ) => {
        if (error) result.error = error;
        result.response = response;
      }
    );

    return result;
  }

  removeBreakpoint(breakpointId: string) {
    const result: {error?: Error} = {};
    this.post(
      'Debugger.removeBreakpoint',
      {breakpointId},
      (error: Error | null) => {
        if (error) result.error = error;
      }
    );
    return result;
  }

  updateBreakpointByUrl(
    breakpointId: string,
    options: inspector.Debugger.SetBreakpointByUrlParameterType
  ) {
    let result = this.removeBreakpoint(breakpointId);
    if (result.error) {
      return result;
    }

    return this.setBreakpointByUrl(options);
  }

  evaluateOnCallFrame(
    options: inspector.Debugger.EvaluateOnCallFrameParameterType
  ) {
    const result: {
      error?: Error;
      response?: inspector.Debugger.EvaluateOnCallFrameReturnType;
    } = {};
    this.post(
      'Debugger.evaluateOnCallFrame',
      options,
      (
        error: Error | null,
        response: inspector.Debugger.EvaluateOnCallFrameReturnType
      ) => {
        if (error) result.error = error;
        result.response = response;
      }
    );
    return result;
  }

  getProperties(options: inspector.Runtime.GetPropertiesParameterType) {
    const result: {
      error?: Error;
      response?: inspector.Runtime.GetPropertiesReturnType;
    } = {};

    this.post(
      'Runtime.getProperties',
      options,
      (
        error: Error | null,
        response: inspector.Runtime.GetPropertiesReturnType
      ) => {
        if (error) result.error = error;
        result.response = response;
      }
    );

    return result;
  }
}