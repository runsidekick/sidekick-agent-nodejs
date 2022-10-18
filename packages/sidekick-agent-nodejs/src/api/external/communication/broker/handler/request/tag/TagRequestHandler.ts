import TagManager from '../../../../../manager/TagManager';
import { BrokerTagHandler } from "../../BrokerHandler";

export default abstract class TagRequestHandler extends BrokerTagHandler {
    constructor(tagManager: TagManager) {
        super(tagManager);
    }
}