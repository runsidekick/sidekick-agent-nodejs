import { RateLimitResult } from "../../types";

export default interface RateLimiter {
    checkRateLimit(criteria: any): RateLimitResult;
}

export class DefaultRateLimiter implements RateLimiter {
    protected milisecondsInMinute = 1000 * 60;
    protected window = 4;
    protected inMinute: number;
    protected idxMask: number;
    protected rateLimitInfos: RateLimitInfo[] = [];

    constructor(inMinute = 200) {
        this.inMinute = inMinute;
        this.idxMask = this.window - 1;
    }

    checkRateLimit(currentTime: number): RateLimitResult {
        const currentMinute = Math.floor(currentTime / this.milisecondsInMinute);
        const rateLimitInfoIdx = (currentMinute & this.idxMask);
        let rateLimitInfo = this.rateLimitInfos[rateLimitInfoIdx];
        if (!rateLimitInfo) {
            rateLimitInfo = this.setRateLimitInfo(rateLimitInfoIdx, null, currentMinute);
        } else {
            if (rateLimitInfo.minute < currentMinute) {
                rateLimitInfo = this.setRateLimitInfo(rateLimitInfoIdx, rateLimitInfo, currentMinute);
            } else if (rateLimitInfo.minute > currentMinute) {
                // Normally this case should not happen, as there is enough window to prevent overlapping
                return 'OK';
            }
        }

        if (!rateLimitInfo) {
            return 'OK';
        }

        rateLimitInfo.increaseCounter();
        const count = rateLimitInfo.counter;
        if (count < this.inMinute) {
            return 'OK';
        } else if (count == this.inMinute) {
            return 'HIT';
        } else {
            return 'EXCEEDED';
        }
    }

    setRateLimitInfo(idx: number, existingRateLimitInfo: RateLimitInfo, currentMinute: number): any {
        const newRateLimitInfo = new RateLimitInfo(currentMinute);
        if (!existingRateLimitInfo) {
            this.rateLimitInfos[idx] = newRateLimitInfo;
        } else {
            if (existingRateLimitInfo == this.rateLimitInfos[idx]) {
                this.rateLimitInfos[idx] = newRateLimitInfo;
            } else {
                return this.rateLimitInfos[idx];
            }
        } 
        
        return newRateLimitInfo;
    }
}

class RateLimitInfo {
    minute: number;
    counter: number

    constructor(minute: number) {
        this.minute = minute;
        this.counter = 0;
    }

    increaseCounter() {
        this.counter = this.counter + 1;
    }
}