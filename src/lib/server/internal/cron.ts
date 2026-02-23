import {Cron} from "croner";
import Log from "$lib/server/internal/log";
import moment from "moment";
import {connection} from "$lib/server/db/database";
import type {RowDataPacket} from "mysql2/promise";

const DATABASE_CLEANUP = new Cron("0 0 0 * * *");

async function databaseGarbageCollection(): Promise<void> {
    Log.info(`Database Garbage Collection running...`,'CRON');
    const startTime: number = Date.now();
    let collected: number = 0;

    const [results] = await connection.query(`SELECT *
                                              FROM sessions`);

    const currentTime: number = Date.now();
    const tmp: string[] = [];

    for (const session of (results as RowDataPacket[])) {
        if (!session.expires) continue;

        if (Date.parse(session.expires) <= currentTime) {
            tmp.push(session.session_id);
        }
    }

    for(const session_id in tmp) {
        await connection.execute(`DELETE FROM sessions WHERE session_id = ?`,[session_id]);
        collected++;
    }

    Log.done(`Database Garbage Collection finished. ${collected} expired session${collected===1?'':'s'} removed. [${Date.now() - startTime}ms]`,'CRON');
}

function initializeJobs(): void {
    if (!DATABASE_CLEANUP.isRunning()) {
        DATABASE_CLEANUP.schedule(databaseGarbageCollection);
    }

    Log.info(`Jobs scheduled.\n ➜ Database Garbage Collection: ${moment(DATABASE_CLEANUP.nextRun()).fromNow()}`,'CRON');
}

export default {initializeJobs};