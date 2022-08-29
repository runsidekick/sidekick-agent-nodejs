import CommunicationManager from "../../api/external/communication/CommunicationManager";
import Task from "./Task";

export default class SendStatusTask implements Task {
    execute() {
        CommunicationManager.sendApplicationStatusEvent();
    }
}