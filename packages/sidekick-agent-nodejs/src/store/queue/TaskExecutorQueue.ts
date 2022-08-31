import PQueue, { QueueAddOptions } from 'p-queue';
import Logger from '../../logger';
import ConfigProvider from "../../config/ConfigProvider";
import { ConfigNames } from "../../config/ConfigNames";

class MaxSizeQueue {
    maxSize: number;
    queue: any[];

    constructor() {
        this.maxSize = ConfigProvider.get<number>(ConfigNames.taskExecutionQueue.maxSize);
        this.queue = [];
    }

    enqueue(run: any, options: any) {
        if (this.size == this.maxSize - 1) {
            this.dequeue;
        }

        this.queue.push(run);
    }

    dequeue() {
        return this.queue.shift();
    }

    get size() {
        return this.queue.length;
    }

    filter(options: any) {
        return this.queue;
    }
}

export default interface TaskExecutorQueue {
    start(): void;
    pause(): void;
    execute(task: any): Promise<unknown>;
}

export class TaskExecutorPQueue implements TaskExecutorQueue {
    protected queue: PQueue<MaxSizeQueue, QueueAddOptions>;
    
    constructor(concurrency: number = 5) {
        this.queue = new PQueue({ concurrency, queueClass: MaxSizeQueue });
    }

    start() {
        if (this.queue.isPaused) {
            Logger.debug('<TaskExecutorPQueue> Task executor service started.');
            this.queue.start();
        }
    }

    pause() {
        if (!this.queue.isPaused) {
            Logger.debug('<TaskExecutorPQueue> Task executor service paused.');
            this.queue.pause();
        }
    }

    execute(task: any) {
       return this.queue.add(task);
    }
}