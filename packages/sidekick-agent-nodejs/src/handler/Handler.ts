import { Message } from "../types";

export default interface Handler {
    handle(message: Message): any | undefined;
}