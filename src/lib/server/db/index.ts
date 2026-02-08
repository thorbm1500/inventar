import {sql} from "$lib/server/db/database";
import * as schema from "$lib/server/db/schema";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    console.log(`Initializing database...`)
    await applySettings();
    await createTables();
}

async function applySettings(): Promise<void> {
    console.log(`Initializing database settings...`)
    await sql`SET timezone='Europe/Copenhagen'`
        .then(() => console.log(`Database settings applied.`))
        .catch(error => console.error(`Failed to apply database settings. ${error}`));
}

/**
 * Creates all the default tables, in the database,
 * and adds the table's default values, if any.
 */
async function createTables(): Promise<void> {
    console.log(`Table creation starting...`)
    await schema.createTableCurrencies(sql);
    await schema.createTableInventories(sql);
    await schema.createTableInventoryAccessList(sql);
    await schema.createTableLabels(sql);
    await schema.createTableLabelColors(sql);
    await schema.createTableItems(sql);
    await schema.createTableItemLabels(sql);
    await schema.createTablePendingItemChanges(sql);
    await schema.createTableItemAssets(sql);
    await schema.createTableUsers(sql);
    await schema.createTableSessions(sql);
    await schema.createTableResetTokens(sql);
    console.log(`Table creation finished.`)
}