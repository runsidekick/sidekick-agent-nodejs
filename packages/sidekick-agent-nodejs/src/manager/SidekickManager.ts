import DebugApi, { DefaultDebugApi } from '../api/internal/debug/DebugApi';
import DebugBrokerApi from '../api/external/communication/broker/DebugBrokerApi';
import CommunicationApi from '../api/external/communication/CommunicationApi';
import Listener from '../listener/Listener';
import DebugApiListener from '../listener/debug/DebugApiListener';
import CommunicationApiListener from '../listener/communication/CommunicationApiListener';
import BrokerHandlerContainer from '../api/external/communication/broker/handler/BrokerHandlerContainer';
import ApiStatus from '../api/status/ApiStatus';
import ApiStatusListener from '../listener/apistatus/ApiStatusListener';
import Scheduler, { TaskScheduler } from '../scheduler/Scheduler';
import ExpiredProbeCleanTask from '../scheduler/task/ExpiredProbeCleanTask';
import SendStatusTask from '../scheduler/task/SendStatusTask';
import ProbeStore from '../store/probe/ProbeStore';
import ConfigProvider from '../config/ConfigProvider';
import { ConfigNames } from '../config/ConfigNames';
import { DefaultBufferedCommunicationApi } from '../api/external/communication/BufferedCommunicationApi';
import Logger from '../logger';
import { DefaultTracepointManager } from '../api/external/manager/TracepointManager';
import { DefaultLogpointManager } from '../api/external/manager/LogpointManager';
import { DefaultTagManager } from '../api/external/manager/TagManager';
import { DefaultConfigManager } from '../api/external/manager/ConfigManager';
import ApplicationStatusTracePointProvider from '../application/status/tracepoint/ApplicationStatusTracePointProvider';
import ApplicationStatusLogPointProvider from '../application/status/logpoint/ApplicationStatusLogPointProvider';
import CommunicationManager from '../api/external/communication/CommunicationManager';
import DisabledErrorCollectionActivateTask from '../scheduler/task/DisabledErrorCollectionActivateTask';

export default class SidekickManager {
    private debugApi: DebugApi;
    private communicationApi: CommunicationApi;
    private debugApiListener: Listener;
    private agentStatusListener: Listener;
    private communicationApiListener: Listener
    private scheduler: Scheduler;
    private started = false;

    constructor(){
        /**
         * clear states if exists
         */
    }

    start(): Promise<SidekickManager> {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                if (this.started) {
                    Logger.info('<SidekickManager> SidekickManager already started.');
                    return resolve(self);
                }

                const probeStore = new ProbeStore();
                const agentStatus = new ApiStatus(new Map<string, boolean>());

                self.debugApi = new DefaultDebugApi(probeStore);
                const debugBrokerApi = new DebugBrokerApi(
                    DebugBrokerApi.generateBrokerUrl(
                        ConfigProvider.get<string>(ConfigNames.broker.host),
                        ConfigProvider.get<number>(ConfigNames.broker.port),
                    ),
                    {
                        headers: {
                            ...DebugBrokerApi.generateBrokerHeaders()
                        }
                    }
                );

                const bufferdCommunicationApi = new DefaultBufferedCommunicationApi(debugBrokerApi);
                self.communicationApi = bufferdCommunicationApi;

                const tracepointManager = new DefaultTracepointManager(self.debugApi);
                const logpointManager = new DefaultLogpointManager(self.debugApi);
                const tagManager = new DefaultTagManager(self.debugApi);
                const configManager = new DefaultConfigManager(self.debugApi);
                CommunicationManager.setProviderList([
                    new ApplicationStatusTracePointProvider(tracepointManager),
                    new ApplicationStatusLogPointProvider(logpointManager)
                ]);

                const brokerHandlerContainer = new BrokerHandlerContainer(
                    tracepointManager, logpointManager, tagManager, configManager);
                self.debugApiListener = new DebugApiListener(
                    self.debugApi,
                    agentStatus,
                );

                self.communicationApiListener = new CommunicationApiListener(
                    self.communicationApi,
                    brokerHandlerContainer,
                    self.debugApi,
                    agentStatus,
                );

                self.agentStatusListener = new ApiStatusListener(
                    bufferdCommunicationApi,
                    agentStatus,
                );

                self.agentStatusListener.listen();
                self.debugApiListener.listen();
                self.communicationApiListener.listen().then(() => {
                    this.started = true;
                    self.initiateSchedular(probeStore);
                    Logger.info('<SidekickManager> Agent started succesfully.');
                    resolve(self);
                }).catch((err) => {
                    Logger.error('<SidekickManager> An error occured while starting agent.', err);
                    reject(err);
                });
            } catch (error) {
                Logger.error('<SidekickManager> An error occured while starting agent.', error);
                reject(error);
            }
        })
    }

    stop() {
        this.started = false;

        this.agentStatusListener.unlisten();
        this.communicationApiListener.unlisten();
        this.debugApiListener.unlisten();

        this.scheduler.stop();
    }

    getDebugApi(): DebugApi {
        return this.debugApi;
    }

    private initiateSchedular(probeStore: ProbeStore) {
        Logger.debug('<SidekickManager> Initiate schedular working ...');

        this.scheduler = new TaskScheduler([
            { period: 30, task: new ExpiredProbeCleanTask(probeStore) },
            { period: 60, task: new SendStatusTask() },
            { period: 30, task: new DisabledErrorCollectionActivateTask(this.debugApi) },
        ]);

        this.scheduler.start();
    }
}