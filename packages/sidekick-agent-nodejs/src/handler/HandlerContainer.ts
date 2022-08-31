import { Message } from "../types";
import Handler from "./Handler";

export default interface HandlerContainer {
    getHandler(message: Message): Handler | undefined;
}