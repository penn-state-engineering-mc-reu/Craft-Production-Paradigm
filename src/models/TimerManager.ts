class TimerNotFoundException extends Error
{
    constructor(timerID: any)
    {
        super(`The timer ID ${timerID} was not found.`);
    }
}

class TimerIDInUseException extends Error
{
    constructor(timerID: any)
    {
        super(`The timer ID ${timerID} is already in use`);
    }
}

class TimerInfo
{
    public scheduledTimeoutIDs: Set<NodeJS.Timer>;
    public currentRuns: Set<Promise<void>>;
    public runner: TimerRunner;
    public stopping: boolean;

    constructor(runner: TimerRunner) {
        this.scheduledTimeoutIDs = new Set<NodeJS.Timer>();
        this.currentRuns = new Set<Promise<void>>();
        this.runner = runner;
        this.stopping = false;
    }
}

type TimerRunner = (manager: TimerManager, timerID: any) => Promise<void>;

export class TimerManager
{
    private timers: Map<any, TimerInfo> = new Map<any, TimerInfo>();

    private async runTimer(timerID: any, timeoutID: NodeJS.Timer): Promise<void>
    {
        let currentTimer = this.timers.get(timerID);
        if(currentTimer === undefined) throw new TimerNotFoundException(timerID);

        currentTimer.scheduledTimeoutIDs.delete(timeoutID);

        // if(currentTimer.currentRun != null) await currentTimer.currentRun;

        let timerPromise = currentTimer.runner(this, timerID);

        // this.timers.set(timerID, new TimerInfo(
        //     null,
        //     timerPromise
        // ));

        currentTimer.currentRuns.add(timerPromise);

        await timerPromise;

        let timerInfo = this.timers.get(timerID);
        if(timerInfo !== undefined)
        {
            timerInfo.currentRuns.delete(timerPromise);
            // else
            // {
            //     this.timers.set(timerID, setTimeout(this.runTimer, result, timerID, runner));
            // }
        }
    }

    public scheduleTimer(timerID: any, delay: number): void
    {
        let currentTimer = this.timers.get(timerID);
        if(currentTimer === undefined) throw new TimerNotFoundException(timerID);

        if(!currentTimer.stopping)
        {
            let timeoutID: NodeJS.Timer;
            let timerManager = this;
            timeoutID = setTimeout(() => {
                timerManager.runTimer(timerID, timeoutID);
            }, delay);
            currentTimer.scheduledTimeoutIDs.add(timeoutID);
            console.log(`Scheduled new run (${currentTimer.scheduledTimeoutIDs.size} scheduled)`);
        }
    }

    public addTimer(timerID: any, initialDelay: number, runner: TimerRunner): void
    {
        if(this.timerExists(timerID)) throw new TimerIDInUseException(timerID);

        this.timers.set(timerID, new TimerInfo(runner));
        this.scheduleTimer(timerID, initialDelay);
    }

    public timerExists(timerID: any): boolean
    {
        return this.timers.has(timerID);
    }

    public timerIsExecuting(timerID: any): boolean
    {
        let currentTimer = this.timers.get(timerID);
        if(currentTimer === undefined) throw new TimerNotFoundException(timerID);

        return (currentTimer.currentRuns.size > 0);
    }

    public async removeTimer(timerID: any): Promise<number>
    {
        let currentTimer = this.timers.get(timerID);
        if(currentTimer === undefined) throw new TimerNotFoundException(timerID);

        if(!currentTimer.stopping)
        {
            currentTimer.stopping = true;

            console.log(`Canceling ${currentTimer.scheduledTimeoutIDs.size} runs`);
            currentTimer.scheduledTimeoutIDs.forEach((value => {
                clearTimeout(value);
            }));

            return new Promise<number>(async resolve => {
                let results = await Promise.all((currentTimer as TimerInfo).currentRuns);
                return resolve(results.length);
            });
        }
        else
        {
            return Promise.resolve(0);
        }
    }
}