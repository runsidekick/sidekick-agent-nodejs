import { CommunicationApiData } from "../../../types";
import { ConnectableApi, ConnectableApiEventNames } from "../../Api";

export const CommunicationApiEventNames = {
    ...ConnectableApiEventNames,
    MESSAGE: 'MESSAGE',
}

export default interface CommunicationApi extends ConnectableApi { 
    send(data: CommunicationApiData): any;
}