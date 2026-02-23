import {init} from "$lib/server/db/database";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    await init();
}