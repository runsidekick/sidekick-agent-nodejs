import CommunicationUtils from "../../../utils/CommunicationUtils";
import { ApplicationStatus, ApplicationStatusEvent, CommunicationApiData } from "../../../types";
import CommunicationApi from "./CommunicationApi";
import Logger from '../../../logger';
import ApplicationStatusProvider from "../../../application/status/ApplicationStatusProvider";
import UuidUtils from "../../../utils/UuidUtils";
import Application from "../../../application/Application";

export default class CommunicationManager {
    private static comminicationApi: CommunicationApi;
    private static applicationStatusProviderList: ApplicationStatusProvider[];

    private constructor(){}
    
    static setCommunicationApi(comminicationApi: CommunicationApi) {
        CommunicationManager.comminicationApi = comminicationApi;
    }

    static setProviderList(applicationStatusProviderList: ApplicationStatusProvider[]) {
        CommunicationManager.applicationStatusProviderList = applicationStatusProviderList;
    }

    static send(data: any) {
        if (CommunicationManager.comminicationApi) {
            Logger.debug('<CommunicationManager> Sending data to communication api.');

            CommunicationManager.comminicationApi.send(data);
        }
    }

    static sendRequest(data: CommunicationApiData) {
         CommunicationManager.send(data);
    }

    static sendResponse(data: CommunicationApiData) {
         CommunicationUtils.appendResponseProperties(data);
         CommunicationManager.send(data);
    }

    static sendEvent(data: CommunicationApiData) {
        CommunicationUtils.appendEventProperties(data);
        CommunicationManager.send(data);
    }

    static sendApplicationStatusEvent(client?: string) {
        const applicationInfo = Application.getApplicationInfo();
        const applicationStatus = {
            name: applicationInfo.applicationName,
            hostName: applicationInfo.hostname,
            instanceId: applicationInfo.applicationInstanceId,
            runtime: applicationInfo.applicationRuntime,
            stage: applicationInfo.applicationStage,
            customTags: applicationInfo.applicationTags 
                ? Object.keys(applicationInfo.applicationTags).map(key => {
                    return {
                        tagName: key,
                        tagValue: applicationInfo.applicationTags[key],
                    };
                }) 
                : [],
            version: applicationInfo.applicationVersion,
        } as ApplicationStatus;

        CommunicationManager.applicationStatusProviderList.forEach(provider => {
            provider.provide(applicationStatus, client);
        });
        
        CommunicationManager.sendEvent(new ApplicationStatusEvent(
            UuidUtils.generateId(),
            applicationStatus,
            client
        ));
    }
}