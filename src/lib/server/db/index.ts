import {sql} from "$lib/server/db/database";
import * as schema from "$lib/server/db/schema";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    console.log(`Initializing database...`)
    await applySettings();
    await schema.createTables();
}

async function applySettings(): Promise<void> {
    console.log(`Initializing database settings...`)
    await sql`SET timezone='Europe/Copenhagen'`
        .then(() => console.log(`Database settings applied.`))
        .catch(error => console.error(`Failed to apply database settings. ${error}`));
}