import { setInterval } from "timers";
import Task from "./task/Task";
import {
    SCHEDULAR_SENSITIVITY,
    SCHEDULAR_MAX_TICK,
} from '../constants';
import Logger from '../logger';

export default interface Scheduler {
    start(): void;
    add(period: number, task: Task): boolean;
    stop(): void;
}

export class TaskScheduler implements Scheduler {
    private interval: any;
    private tasks: { tickCount: number, task: Task }[] = [];
    private schedulerTickCount = 0;
    
    constructor() {
    }

    start() {
        this.interval = setInterval(() => {    
            try {
                if (this.schedulerTickCount >= SCHEDULAR_MAX_TICK) {
                    this.schedulerTickCount = 0;
                }
    
                this.schedulerTickCount++;
                let tasksWillBeExecuted: any[] = [];
                this.tasks.forEach(task => {
                    if (this.schedulerTickCount % task.tickCount == 0) {
                        tasksWillBeExecuted.push(task.task.execute())
                    }
                });
    
                Promise.all(tasksWillBeExecuted)
                    .then()
                    .catch(err => {
                        Logger.debug(`<TaskScheduler> An error occured while executing scheduled task. ${err.message}`);
                    })
    
            } catch (error) {
                Logger.debug(`<TaskScheduler> An error occured while task interval. ${this.schedulerTickCount} ${error.message}`);
            }
        }, SCHEDULAR_SENSITIVITY * 1000);

        this.interval.unref();
    }

    add(period: number, task: Task): boolean {
        const tickCount = this.getTickCount(period);
        if (tickCount < 1) {
            return false;
        }
        
        this.tasks.push({
            tickCount,
            task,
        })

        return true;
    }

    stop() {
        clearInterval(this.interval);
        this.tasks = [];
    }

    private getTickCount(period: number): number {
        const tickCount = Math.round(period / SCHEDULAR_SENSITIVITY);
        return (tickCount <= SCHEDULAR_MAX_TICK && tickCount >= 1) ? tickCount : -1;
    }
} 