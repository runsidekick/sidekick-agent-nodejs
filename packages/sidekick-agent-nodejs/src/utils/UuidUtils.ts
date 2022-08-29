import { v4 as uuidv4 } from 'uuid';
import { v5 as uuidv5 } from 'uuid';
import { AGENT_UUID_CONST } from '../constants';

export default class UuidUtils {
    static generateId(): string {
        return uuidv4();
    };
    
    static generareIdFrom(value: string): string {
        return uuidv5(value, AGENT_UUID_CONST);
    };
    
    static generateShortId(): string {
        return UuidUtils.generateId().substring(0, 8);
    };
}

