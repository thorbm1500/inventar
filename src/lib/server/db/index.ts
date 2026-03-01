import {LOGGER} from "../../../hooks.server";
import {init} from "$lib/server/db/database";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    LOGGER.wait('Initializing database...');
    const startTime: number = Bun.nanoseconds();
    await init();

    LOGGER.done('Database initialization completed. [', String(Math.round((Bun.nanoseconds() - startTime) / 1000000)), 'ms]');
}