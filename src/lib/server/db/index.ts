import {LOGGER} from "../../../hooks.server";
import {init} from "$lib/server/db/database";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    await LOGGER.timed('Initializing database...','Database initialization completed.',init);
}