import CommunicationUtils from "../../utils/CommunicationUtils";
import CommunicationManager from "../../api/external/communication/CommunicationManager";
import { ConfigNames } from "../../config/ConfigNames";
import ConfigProvider from "../../config/ConfigProvider";
import Task from "./Task";

export default class GetConfigTask implements Task {
    execute() {
        if (!ConfigProvider.get<boolean>(ConfigNames.agent.silent)) {
            CommunicationManager.sendRequest(CommunicationUtils.createGetConfigRequest());
        }
    }
}