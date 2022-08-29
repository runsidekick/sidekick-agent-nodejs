import Application from "../application/Application";
import ApplicationInfo from "../application/ApplicationInfo";
import { 
    BrokerEvent,
    BrokerResponse,
    CommunicationApiData,
    FilterTracePointsRequest,
    FilterLogPointsRequest
} from "../types";
import UuidUtils from "./UuidUtils";

export default class CommunicationUtils {
    static createTracepointFilterRequest() {
        const applicationInfo = Application.getApplicationInfo();
        if (!applicationInfo) {
            return;
        }

        return new FilterTracePointsRequest({
            name: applicationInfo.applicationName,
            stage: applicationInfo.applicationStage,
            version: applicationInfo.applicationVersion,
            customTags: applicationInfo.applicationTags
        },
        UuidUtils.generateId())
    }

    static createLogpointFilterRequest() {
        const applicationInfo = Application.getApplicationInfo();
        if (!applicationInfo) {
            return;
        }

        return new FilterLogPointsRequest({
            name: applicationInfo.applicationName,
            stage: applicationInfo.applicationStage,
            version: applicationInfo.applicationVersion,
            customTags: applicationInfo.applicationTags
        },
        UuidUtils.generateId())
    }

    static appendResponseProperties(data: CommunicationApiData) { 
        const response = data as BrokerResponse;
        if (response) {
            const applicationInfo: ApplicationInfo = Application.getApplicationInfo();
            if (applicationInfo) {
                if (!response.applicationName) {
                    response.applicationName = applicationInfo.applicationName;
                }

                if (!response.applicationInstanceId) {
                    response.applicationInstanceId = applicationInfo.applicationInstanceId;
                }
            }
        }
    }

    static appendEventProperties(data: CommunicationApiData) {
        const event = data as BrokerEvent;
        if (event) {
            if (!event.id) {
                event.id = UuidUtils.generateId();
            }

            if (!event.time) {
                event.time = new Date().getTime();
            }

            const applicationInfo: ApplicationInfo = Application.getApplicationInfo();
            if (applicationInfo) {
                if (!event.hostName) {
                    event.hostName = applicationInfo.hostname;
                }

                if (!event.applicationName) {
                    event.applicationName = applicationInfo.applicationName;
                }

                if (!event.applicationInstanceId) {
                    event.applicationInstanceId = applicationInfo.applicationInstanceId;
                }
            }
        }
    }
}