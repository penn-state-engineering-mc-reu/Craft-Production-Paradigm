"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class TimerNotFoundException extends Error {
    constructor(timerID) {
        super(`The timer ID ${timerID} was not found.`);
    }
}
class TimerIDInUseException extends Error {
    constructor(timerID) {
        super(`The timer ID ${timerID} is already in use`);
    }
}
class TimerInfo {
    constructor(runner) {
        this.scheduledTimeoutIDs = new Set();
        this.currentRuns = new Set();
        this.runner = runner;
        this.stopping = false;
    }
}
class TimerManager {
    constructor() {
        this.timers = new Map();
    }
    runTimer(timerID, timeoutID) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTimer = this.timers.get(timerID);
            if (currentTimer === undefined)
                throw new TimerNotFoundException(timerID);
            currentTimer.scheduledTimeoutIDs.delete(timeoutID);
            // if(currentTimer.currentRun != null) await currentTimer.currentRun;
            let timerPromise = currentTimer.runner(this, timerID);
            // this.timers.set(timerID, new TimerInfo(
            //     null,
            //     timerPromise
            // ));
            currentTimer.currentRuns.add(timerPromise);
            yield timerPromise;
            let timerInfo = this.timers.get(timerID);
            if (timerInfo !== undefined) {
                timerInfo.currentRuns.delete(timerPromise);
                // else
                // {
                //     this.timers.set(timerID, setTimeout(this.runTimer, result, timerID, runner));
                // }
            }
        });
    }
    scheduleTimer(timerID, delay) {
        let currentTimer = this.timers.get(timerID);
        if (currentTimer === undefined)
            throw new TimerNotFoundException(timerID);
        if (!currentTimer.stopping) {
            let timeoutID;
            let timerManager = this;
            timeoutID = setTimeout(() => {
                timerManager.runTimer(timerID, timeoutID);
            }, delay);
            currentTimer.scheduledTimeoutIDs.add(timeoutID);
            console.log(`Scheduled new run (${currentTimer.scheduledTimeoutIDs.size} scheduled)`);
        }
    }
    addTimer(timerID, initialDelay, runner) {
        if (this.timerExists(timerID))
            throw new TimerIDInUseException(timerID);
        this.timers.set(timerID, new TimerInfo(runner));
        this.scheduleTimer(timerID, initialDelay);
    }
    timerExists(timerID) {
        return this.timers.has(timerID);
    }
    timerIsExecuting(timerID) {
        let currentTimer = this.timers.get(timerID);
        if (currentTimer === undefined)
            throw new TimerNotFoundException(timerID);
        return (currentTimer.currentRuns.size > 0);
    }
    removeTimer(timerID) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTimer = this.timers.get(timerID);
            if (currentTimer === undefined)
                throw new TimerNotFoundException(timerID);
            if (!currentTimer.stopping) {
                currentTimer.stopping = true;
                console.log(`Canceling ${currentTimer.scheduledTimeoutIDs.size} runs`);
                currentTimer.scheduledTimeoutIDs.forEach((value => {
                    clearTimeout(value);
                }));
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    let results = yield Promise.all(currentTimer.currentRuns);
                    return resolve(results.length);
                }));
            }
            else {
                return Promise.resolve(0);
            }
        });
    }
}
exports.TimerManager = TimerManager;
//# sourceMappingURL=TimerManager.js.map