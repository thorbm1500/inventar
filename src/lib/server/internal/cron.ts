import { Cron } from "croner";
import Log from "$lib/server/internal/log";
import moment from "moment";

const DATABASE_CLEANUP = new Cron("0 0 0 * * *");

function databaseGarbageCollection(): void {

}

function initializeJobs(): void {
    if (!DATABASE_CLEANUP.isRunning()) {
        Log.info(`[Cron] Database GarbageCollection scheduled. First run will be executed ${moment(DATABASE_CLEANUP.nextRun()).fromNow()}`);
        DATABASE_CLEANUP.schedule(databaseGarbageCollection);
    }
}

export default {initializeJobs};