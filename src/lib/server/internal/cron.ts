import {LOGGER} from "../../../hooks.server";
import {Cron} from "croner";
import moment from "moment";
import {getConnection} from "$lib/server/db/database";

const DATABASE_CLEANUP = new Cron("0 0 */24 * * *");

/**
 * todo
 */
async function databaseGarbageCollection(): Promise<void> {
    LOGGER.debug(`Database Garbage Collection running...`);
    const startTime: number = Date.now();
    let collected: number = 0;

    const results: any = await getConnection()`SELECT *
                                          FROM sessions`

    const currentTime: number = Date.now();
    const tmp: string[] = [];

    for (let session of results) {
        if (!session.expires) continue;

        if (Date.parse(session.expires) <= currentTime) {
            tmp.push(session.session_id);
        }
    }

    await getConnection().begin(tx => {
        for (const session_id in tmp) {
            tx`DELETE
               FROM sessions
               WHERE session_id = ${session_id}`
            collected++;
        }
    })
        .catch((err: any): void => LOGGER.error(`Failed to delete expired sessions. `, err));

    LOGGER.info(`Database Garbage Collection finished. ${collected} expired session${collected === 1 ? '' : 's'} removed. [${Date.now() - startTime}ms]`);
}

/**
 * todo
 */
function initializeJobs(): void {
    LOGGER.wait('Scheduling cron jobs...');
    if (!DATABASE_CLEANUP.isRunning()) {
        DATABASE_CLEANUP.schedule(databaseGarbageCollection);
    }

    LOGGER.done(`Jobs scheduled.\nDatabase Garbage Collection: ${moment(DATABASE_CLEANUP.nextRun()).fromNow()}`);
}

export default {initializeJobs};