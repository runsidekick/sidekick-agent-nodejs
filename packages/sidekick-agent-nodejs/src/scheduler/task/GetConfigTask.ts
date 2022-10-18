import CommunicationUtils from "../../utils/CommunicationUtils";
import CommunicationManager from "../../api/external/communication/CommunicationManager";
import Task from "./Task";

export default class GetConfigTask implements Task {
    execute() {
        CommunicationManager.sendRequest(CommunicationUtils.createGetConfigRequest());
    }
}