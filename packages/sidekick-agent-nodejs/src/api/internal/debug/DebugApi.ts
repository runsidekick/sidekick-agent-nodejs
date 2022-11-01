import { Probe, ProbeInfo } from '../../../types';
import V8InspectorApi, { DefaultV8InspectorApi } from '../v8/V8inspectorApi';
import * as inspector from 'inspector';
import ProbeStore from "../../../store/probe/ProbeStore";
import ScriptStore from '../../../store/script/ScriptStore';
import ScriptUtils from '../../../utils/ScriptUtils';
import EventEmitter from "events";
import { ConnectableApi, ConnectableApiEventNames } from "../../Api";
import ProbeActionFactory from './action/ProbeActionFactory';
import ProbeAction from './probe/ProbeAction';
import ProbeContext from './probe/ProbeContext';
import { ConfigNames } from '../../../config/ConfigNames';
import ConfigProvider from '../../../config/ConfigProvider';
import * as ProbeErrors from '../../../error/ProbeErrors';
import ProbeUtils from '../../../utils/ProbeUtils';
import FileUtils from '../../../utils/FileUtils';
import PathUtils from '../../../utils/PathUtils';
import VersionUtils from '../../../utils/VersionUtils';
import Logger from '../../../logger';
import RateLimiter, { DefaultRateLimiter } from '../../../limit/rate/RateLimiter';
import { ERROR_COLLECTION_DENY_FILE_NAMES, ERROR_PROBE_STORE_ID } from '../../../constants';

export const DebugApiEventNames = {
    ...ConnectableApiEventNames,
    MESSAGE: 'MESSAGE',
}

export default interface DebugApi extends ConnectableApi {
    get(probeId: string): Probe;
    getAll(): Probe[];
    getByLocationId(locationId: string): Set<string>;
    getByTag(tag: string): Set<string>;
    add(probe: Probe): void;
    update(probe: Probe): void;
    delete(probe: Probe): void;
    enable(probe: Probe): void;
    disable(probe: Probe): void;
    enableErrorCollect(): void;
    disableErrorCollect(): void;
    activateErrorCollection(): void;
    deactivateErrorCollection(): void;
}

export class DefaultDebugApi extends EventEmitter implements DebugApi {
    protected v8InspectorApi: V8InspectorApi;
    protected probeStore: ProbeStore;
    protected scriptStore: ScriptStore;
    protected session: inspector.Session;
    protected paused: boolean;
    protected numBreakpointHitsBeforeReset = 0;
    protected enableAsyncCallStack: boolean;
    protected cleanupAsyncCallStackInterval: number;
    protected resetV8Debugger: boolean;
    protected resetV8DebuggerThreshold: number;
    protected cleanEveryXCalls : number;
    protected pausesToClean: number;
    protected callsToClean: number;
    protected cleanupAsyncCallStackIntervalRef: any;
    protected hashCheckEnable: boolean;
    protected connected = false;
    protected errorCollectionInitiated: boolean;
    protected errorStackRateLimiter: RateLimiter;
    
    constructor(probeStore?: ProbeStore, scriptStore?: ScriptStore) {
        super();

        this.probeStore = probeStore || new ProbeStore();
        this.scriptStore = scriptStore || new ScriptStore();
        this.paused = false;
        this.fillConfig();
    }
    
    connect(reload?: boolean): void {
        this.tryConnect(reload);
        this.activateErrorCollection();
    }

    reconnect(): void {
        this.close(true); 
        this.connect(true);
    }

    close(reload?: boolean): void {
        this.connected = false;
        if (this.session) {
            try {
                this.deactivateErrorCollection();
                this.clearCleanupAsyncCallStackIntervalRef();
                this.clearAllBreakpoints(!reload);
                this.session.post('Debugger.setBreakpointsActive', { active: false });
                this.session.post('Debugger.disable');
                this.session.post('Debugger.resume'); 
            } finally {
                this.session.disconnect();
                this.session = null;
            }
        }
    }

    get(probeId: string): Probe {
        const probeAction = this.probeStore.get(probeId);
        return probeAction && probeAction.getContext() ? probeAction.getContext().getProbe() : undefined;
    }

    getAll(): Probe[] {
        return this.probeStore.getAllProbes();
    }

    getByLocationId(locationId: string): Set<string> {
        return this.probeStore.getProbeIdsByLocationId(locationId);
    }

    getByTag(tag: string): Set<string> {
        return this.probeStore.getProbeByTag(tag);
    }

    add(probe: Probe): void {
        const filename = PathUtils.canonizeFileName(probe.fileName);
        const scriptWrapper = this.scriptStore.getByScriptUrl(filename);
        if (!scriptWrapper) {
            throw new ProbeErrors.ScriptNotFound(`Script did not find with name ${filename}`);
        }

        const sourcefileInfo = scriptWrapper.findSourceFileInfo(filename);
        if (!sourcefileInfo) {
            throw new ProbeErrors.ScriptNotFound(`Script did not find with name ${filename}`);
        }

        if(this.probeStore.get(probe.id)) {
            throw new ProbeErrors.ProbeAlreadyExistError(`Probe with id ${probe.id} already exist.`);
        };

        if (this.hashCheckEnable
            && !FileUtils.isFileTypescript(filename) 
            && probe.fileHash 
            && !scriptWrapper.isCompatableWithFile(probe.fileHash)) {
            throw new ProbeErrors.SourceCodeMisMatchDetected();
        }

        ProbeUtils.validateCondition(probe);

        let v8BreakpointId;
        const generatedPosition = this.scriptStore.generatedPositionFor(filename, probe.lineNo);
        if (this.probeStore.isV8BreakpointExistOnLocation(probe)) {
            v8BreakpointId = this.probeStore.findV8Breakpoint(probe);
            Logger.debug(`<DefaultDebugApi> Existing V8breakpoint will updated ${JSON.stringify(v8BreakpointId)} for new probe ${probe.id}`);
        } else {
            const setBreakpointResult = this.v8InspectorApi.setBreakpointByUrl({
                lineNumber: (generatedPosition ? generatedPosition.line : probe.lineNo) - 1,
                url: `${sourcefileInfo.rawPath}`,
                ...(probe.tracingEnabled ? { condition: 'global.__sidekick_loadTraceInfo()' } : undefined)
            });

            if (setBreakpointResult.error || !setBreakpointResult.response) {
                throw new ProbeErrors.PutProbeFailed(setBreakpointResult.error.message);
            }

            v8BreakpointId = setBreakpointResult.response.breakpointId;     
            Logger.debug(`<DefaultDebugApi> V8Breakpoint stored ${v8BreakpointId}`);
        }

        const probeAction: ProbeAction<ProbeContext> = ProbeActionFactory.getAction(
            {
                v8BreakpointId,
                probe,
                generatedPosition,
            },
            this.scriptStore,
            this.v8InspectorApi,
        )

        if (!probeAction) {
            throw new ProbeErrors.PutProbeFailed('<DefaultDebugApi> Probe did not put.');
        }

        this.probeStore.set(v8BreakpointId, probeAction);
    }

    update(probe: Probe): void {
        const probeAction = this.probeStore.get(probe.id);
        if (!probeAction) {
            throw new ProbeErrors.NoProbeExistWithId();
        }

        if (probeAction.getClient() !== probe.client) {
            throw new ProbeErrors.ClientHasNoAccessToProbe();
        }

        Logger.debug(`<DefaultDebugApi> Probe will updated ${probe.id}`);

        const currentProbe = probeAction.getProbe();
        if (currentProbe.tracingEnabled !== probe.tracingEnabled) {
            const scriptWrapper = this.scriptStore.getByScriptUrl(currentProbe.fileName);
            if (!scriptWrapper) {
                Logger.debug(`<DefaultDebugApi> Script did not find with name ${currentProbe.fileName}`);
                return;
            }
    
            const sourcefileInfo = scriptWrapper.findSourceFileInfo(currentProbe.fileName);
            if (!sourcefileInfo) {
                Logger.debug(`<DefaultDebugApi> Script did not find with name ${currentProbe.fileName}`);
                return;
            }

            const generatedPosition = probeAction.getContext().getGeneratedPosition();
            this.v8InspectorApi.updateBreakpointByUrl(
                probeAction.getV8BreakpointId(),
                {
                    lineNumber: (generatedPosition ? generatedPosition.line : probe.lineNo) - 1,
                    url: `${sourcefileInfo.rawPath}`,
                    ...(probe.tracingEnabled ? { condition: 'global.__sidekick_loadTraceInfo()' } : undefined)
                }
            )
        }

        ProbeUtils.validateCondition(probe);
        probeAction.updateProbe(probe);
    }

    delete(probe: Probe): void {
        const probeAction = this.probeStore.get(probe.id);
        if (!probeAction) {
            throw new ProbeErrors.NoProbeExistWithId();
        }

        if (probeAction.getClient() !== probe.client) {
            throw new ProbeErrors.ClientHasNoAccessToProbe();
        }

        Logger.debug(`<DefaultDebugApi> Probe will deleted ${probe.id}`);
        
        const probeId = probeAction.getId();
        const v8BreakpointId = probeAction.getV8BreakpointId();
        this.probeStore.delete(probeId);
        if (!this.probeStore.isV8BreakpointExist(v8BreakpointId)) {
            this.deleteV8Breakpoint(v8BreakpointId)
        }
    }

    enable(probe: Probe): void {
        const probeAction = this.probeStore.get(probe.id);
        if (!probeAction) {
            throw new ProbeErrors.NoProbeExistWithId();
        }

        if (probeAction.getClient() !== probe.client) {
            throw new ProbeErrors.ClientHasNoAccessToProbe();
        }

        Logger.debug(`<DefaultDebugApi> Probe will enabled ${probe.id}`);

        probeAction.enable()
    }

    disable(probe: Probe): void {
        const probeAction = this.probeStore.get(probe.id);
        if (!probeAction) {
            throw new ProbeErrors.NoProbeExistWithId();
        }

        if (probeAction.getClient() !== probe.client) {
            throw new ProbeErrors.ClientHasNoAccessToProbe();
        }

        Logger.debug(`<DefaultDebugApi> Probe will disabled ${probe.id}`);

        probeAction.disable()
    }

    enableErrorCollect(): void {
        if (!ConfigProvider.get<boolean>(ConfigNames.errorCollection.enable) 
            || !this.errorCollectionInitiated
            || !this.session) {
            return;
        }

        this.appendErrorProbe();
        this.session.post('Debugger.setPauseOnExceptions', { state: 'all' });

        Logger.debug('<DefaultDebugApi> Error collection enabled.');
    }

    disableErrorCollect(): void {
        if (!this.session) {
            return;
        }

        this.session.post('Debugger.setPauseOnExceptions', { state: 'none' });
        this.probeStore.delete(ERROR_PROBE_STORE_ID);

        Logger.debug('<DefaultDebugApi> Error collection disabled.');
    }

    activateErrorCollection(): void {
        if (!ConfigProvider.get<boolean>(ConfigNames.errorCollection.enable)) {
            return;
        }

        this.errorCollectionInitiated = true;
        this.enableErrorCollect();
        if (!this.errorStackRateLimiter) {
            this.errorStackRateLimiter = new DefaultRateLimiter(
                ConfigProvider.get<number>(ConfigNames.errorCollection.rateLimit.totalInMinute));
        }

        Logger.debug('<DefaultDebugApi> Error collection initiated.');
    }

    deactivateErrorCollection() : void {
        this.errorCollectionInitiated = false;
        this.errorStackRateLimiter = null;
        this.disableErrorCollect();
    }

    private fillConfig(): void {
        this.enableAsyncCallStack = ConfigProvider.get<boolean>(ConfigNames.debugApi.enableAsyncCallStack);
        this.cleanupAsyncCallStackInterval = ConfigProvider.get<number>(ConfigNames.debugApi.cleanupAsyncCallStackInterval);
        this.resetV8Debugger = ConfigProvider.get<boolean>(ConfigNames.debugApi.resetV8Debugger);
        this.resetV8DebuggerThreshold = ConfigProvider.get<number>(ConfigNames.debugApi.resetV8DebuggerThreshold);
        this.hashCheckEnable = ConfigProvider.get<boolean>(ConfigNames.scriptStore.hashCheckEnable);
        this.cleanEveryXCalls = this.resetV8DebuggerThreshold;
    }

    private appendErrorProbe() {
        if (this.probeStore.get(ERROR_PROBE_STORE_ID)) {
            this.probeStore.delete(ERROR_PROBE_STORE_ID);
        }

        this.probeStore.set(
            ERROR_PROBE_STORE_ID, 
            ProbeActionFactory.getAction(
                { probe: { id: ERROR_PROBE_STORE_ID, type: 'ErrorStack', actions: ['ErrorRateLimitedProbeAction'] } } as ProbeInfo,
                this.scriptStore,
                this.v8InspectorApi,
            ));
    }

    private tryConnect(reload?: boolean) {
        Logger.debug('<DefaultDebugApi> Connecting to inspector session.');

        this.session = new inspector.Session();
        this.session.connect();
        if (reload && this.v8InspectorApi) {
            this.v8InspectorApi.setSession(this.session)
        } else {
            this.v8InspectorApi = new DefaultV8InspectorApi(this.session);
        }

        this.session.on(
            'Debugger.scriptParsed',
            (script: inspector.InspectorNotification<inspector.Debugger.ScriptParsedEventDataType>) => {
                if (!reload) {
                    this.scriptLoaded(script);
                }
            }
        );
        this.session.on('Debugger.scriptFailedToParse', ({ params }) => {
            if (this.paused || this.session === null) {
              return;
            }
      
            this.cleanDebuggerMemory();
        });
        this.session.on(
            'Debugger.paused',
            (message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) => {
                if (!message || !message.params) {
                    Logger.debug('<DefaultDebugApi> V8Breakpoint paused event cannot be empty.');
                    return;
                }

                try {
                    this.paused = true;
                    if (message.params.reason === 'exception'
                        || message.params.reason === 'promiseRejection') {
                        this.handleErrorDebugPausedEvent(message);
                    } else {
                        this.handleUserDebugPausedEvent(message);
                    }
                } finally {
                    this.paused = false;
                    this.cleanPausesMemory();
                    if (this.resetV8Debugger) {
                        this.tryResetV8Debugger();
                    }
                }
            }    
        );

        if (VersionUtils.validateVersion(12, 9)) {
            this.session.post('Debugger.enable', { maxScriptsCacheSize: 2 });
        } else {
            this.session.post('Debugger.enable');
        }
      
        this.session.post('Debugger.setBreakpointsActive', { active: true });

        if (this.enableAsyncCallStack) {
            this.session.post('Debugger.setAsyncCallStackDepth', { maxDepth: 1 });
            if (VersionUtils.validateVersion(14)) {
                this.cleanupAsyncCallStackIntervalRef = setInterval(() => {
                  try {
                    this.session.post('Debugger.setAsyncCallStackDepth', { maxDepth: 0 });
                    this.session.post('Debugger.setAsyncCallStackDepth', { maxDepth: 1 });
                  } catch (err) {
                    Logger.debug(`<DefaultDebugApi> An error occured while cleanupAsyncCallStack error: ${err}`);
                  }
                }, this.cleanupAsyncCallStackIntervalRef).unref();
            }
        }

        this.connected = true;
        if (!reload) {
            this._emit(DebugApiEventNames.OPEN, this.session);
        }
  
        // TODO: CHECK what is this => this.session.post('Debugger.setPauseOnExceptions', { state: 'all' });
    }

    private clearAllBreakpoints(clearProbe = false) {
        const probeContexts = this.probeStore.getAllProbeContexts();
        if (probeContexts) {
            for(const probeContext of probeContexts) {
                const probeId = probeContext.getProbe().id;
                try {
                    const v8BreakpointId = probeContext.getV8BreakpointId;
                    this.session.post('Debugger.removeBreakpoint', {
                         breakpointId: v8BreakpointId
                    }, error => {
                        Logger.debug(`<DefaultDebugApi> An error occured while clear breakpoint ${error.message}`);
                    });
                } finally {
                    if (clearProbe) {
                        this.probeStore.delete(probeId);
                    }
                }
            }
        }
    }

    private clearCleanupAsyncCallStackIntervalRef() {
        if (this.cleanupAsyncCallStackIntervalRef) {
          clearInterval(this.cleanupAsyncCallStackIntervalRef);
          this.cleanupAsyncCallStackIntervalRef = null;
        }
    }

    private cleanPausesMemory() {
        this.pausesToClean += 1;
        if (this.pausesToClean > this.cleanEveryXCalls && this.session) {
          setImmediate(() => {
            try {
              this.session.post("Debugger.resume");
            } catch (e) {}
          });

          this.pausesToClean = 0;
        }
      }
    
    private cleanDebuggerMemory() {
        this.callsToClean += 1;
        if (this.callsToClean > this.cleanEveryXCalls && !this.paused && this.session) {
          this.session.post("Runtime.releaseObjectGroup", {
            objectGroup: "backtrace"
          });

          this.callsToClean = 0;
        }
    }

    private tryResetV8Debugger() {
        try {
            this.numBreakpointHitsBeforeReset += 1;
            if (this.numBreakpointHitsBeforeReset < this.resetV8DebuggerThreshold) {
              return;
            }

            Logger.debug('<DefaultDebugApi> Try to reset inspector session.');
    
            this.numBreakpointHitsBeforeReset = 0;
            const probeContexts = this.probeStore.getAllProbeContexts();
            
            this.reconnect();
            if (probeContexts) {
                for(const probeContext of probeContexts) {
                    const probe = probeContext.getProbe();

                    const scriptWrapper = this.scriptStore.getByScriptUrl(probe.fileName);
                    if (!scriptWrapper) {
                        Logger.debug(`<DefaultDebugApi> Script did not find with name ${probe.fileName}`);
                        return;
                    }
            
                    const sourcefileInfo = scriptWrapper.findSourceFileInfo(probe.fileName);
                    if (!sourcefileInfo) {
                        Logger.debug(`<DefaultDebugApi> Script did not find with name ${probe.fileName}`);
                        return;
                    }
                    
                    const generatedPosition = probeContext.getGeneratedPosition();
                    if (this.v8InspectorApi) {
                        this.v8InspectorApi.setBreakpointByUrl({
                            lineNumber: (generatedPosition ? generatedPosition.line : probe.lineNo) - 1,
                            url: `${sourcefileInfo.rawPath}`,
                            ...(probe.tracingEnabled ? { condition: 'global.__sidekick_loadTraceInfo()' } : undefined)
                        });
                    }
                }
            }
        } catch (error) {
            Logger.debug(`<DefaultDebugApi> An error occured while trying to reset session. ${error.message}`);
        }
    }

    private deleteV8Breakpoint(v8BreakpointId: string): boolean {
        if (!this.v8InspectorApi) { 
            return null;
        }

        const result = this.v8InspectorApi.removeBreakpoint(v8BreakpointId);
        if (result.error) {
            return false;
        }

        return true;
    }

    private scriptLoaded(script: inspector.InspectorNotification<inspector.Debugger.ScriptParsedEventDataType>) {
        if (!script || !script.params 
            || !script.params.url || !script.params.scriptId) {
            Logger.debug(`<DefaultDebugApi> Script information can not be empty.`);
            return;
        }

        let scriptURL = script.params.url;
        let shouldSkipScript = false;
        if (scriptURL === "" || ScriptUtils.isBlackListedModule(scriptURL)) {
            shouldSkipScript = true;
        }

        if (shouldSkipScript) {
            Logger.debug(`<DefaultDebugApi> Script will skipped. ${scriptURL}`);
            return;
        }

        try {
            this.v8InspectorApi.post(
                'Debugger.getScriptSource', 
                { scriptId: script.params.scriptId }, 
                (err: any, scriptSource: inspector.Debugger.GetScriptSourceReturnType) => {
                    if (err) {
                        Logger.debug(`<DefaultDebugApi> An error occured while get script source. ${scriptURL} ${err.message}`);
                        return;
                    }

                    try {
                        this.scriptStore.set({
                            scriptParams: script.params,
                            scriptRawUrl: scriptURL,
                            scriptSource: scriptSource.scriptSource
                        });
                    } catch (error) {
                        Logger.debug(`<DefaultDebugApi> Script did not stored. ${scriptURL} ${error.message}`);
                    }
                }
            );                  
        } catch (error) {
            Logger.debug(`<DefaultDebugApi> An error occured while loading script. ${scriptURL} ${error.message}`);
        } finally {
            this.cleanDebuggerMemory();
        }
    }

    private handleErrorDebugPausedEvent(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) { 
        try {
            const probeAction = this.probeStore.get(ERROR_PROBE_STORE_ID);
            if (!probeAction) {
                this.disableErrorCollect();
                Logger.debug('<DefaultDebugApi> Error connection probe can not be empty, error collection disabled.');
                return;
            }

            probeAction.getContext().hit();
            const rateLimitResult = this.errorStackRateLimiter.checkRateLimit(new Date().getTime());
            if (rateLimitResult !== 'OK') {
                this.disableErrorCollect();
                Logger.debug('<DefaultDebugApi> Total error connection rate limit hit, error stack collection disabled.');
                return;
            }

            const firstFrame = message.params.callFrames[0];
            if (!firstFrame || !firstFrame.location || !firstFrame.location.scriptId) {
                Logger.debug('<DefaultDebugApi> Error stack collection frame can not be empty.');
                return;
            }

            const scriptStoreData = this.scriptStore.get(firstFrame.location.scriptId);
            if (!scriptStoreData || ERROR_COLLECTION_DENY_FILE_NAMES
                    .some(deniedFileName => scriptStoreData.rawFilename.indexOf(deniedFileName) > -1)) {
                return;
            } 

            probeAction.onProbe(message);
        } catch (error) {
            Logger.debug(`<DefaultDebugApi> An error occured while handling error stack ${error.message}`);
        } 
    }

    private handleUserDebugPausedEvent(message: inspector.InspectorNotification<inspector.Debugger.PausedEventDataType>) {
        try {
            const params = message.params;
            if (!params.hitBreakpoints) {
                Logger.debug('<DefaultDebugApi> V8Breakpoint paused event params cannot be empty.');
                return;
            }

            const v8BreakpointId: string = params.hitBreakpoints[0];
            if (!v8BreakpointId) {
                Logger.debug('<DefaultDebugApi> V8Breakpoint id cannot be empty.');
                return;
            }

            const probes = this.probeStore.getProbeIds(v8BreakpointId);
            if (!probes) {
                Logger.debug('<DefaultDebugApi> Probe did not find in store.');

                this.deleteV8Breakpoint(v8BreakpointId);
                return;
            }

            for (const probeId of probes) {
                const probeAction = this.probeStore.get(probeId);
                try {
                    probeAction.getContext().hit();
                    if (probeAction.isDisabled()) {
                        Logger.debug(`<DefaultDebugApi> Probe ${probeAction.getId()} disabled.`);

                        continue;
                    }

                    if(probeAction.isExpired()) {
                        Logger.debug(`<DefaultDebugApi> Probe ${probeAction.getId()} expired.`);

                        this.delete(probeAction.getProbe());
                        continue;
                    }

                    probeAction.onProbe(message); 
                } catch (error) {
                    Logger.debug(`<DefaultDebugApi> An error occured while handling probe action ${probeAction.getId()}`);
                }
            };    
        } catch (error) {
            Logger.debug(`<DefaultDebugApi> An error occured while handling V8 breakpoint pause event.`);
        } 
    }

    private _emit(event: string, data: any) {
        if (this.connected) {
            this.emit(event, data);
        }
    }
}