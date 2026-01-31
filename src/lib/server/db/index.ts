import {sql} from "$lib/server/db/database";
import * as schema from "$lib/server/db/schema";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    console.log(`Initializing database...`)
    try {
        await applySettings();
        await createTables();
    } catch (error) {
        console.error(error);
    }
}

async function applySettings(): Promise<void> {
    console.log(`Initializing default settings...`)
    try {
        await sql.begin(async (): Promise<void> => {
            await sql`SET timezone='Europe/Copenhagen'`
        })
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to apply default settings. Error: ${error}`);
        return;
    }
}

/**
 * Creates all the default tables, in the database,
 * and adds the table's default values, if any.
 */
async function createTables(): Promise<void> {
    console.log(`Creating database 'currencies'...`)
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableCurrencies(sql).catch(error => {
                console.error(`Failed to create table 'currencies': ${error}`);
            }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableInventories(sql).catch(error => {
            console.error(`Failed to create table 'inventories': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableCategories(sql).catch(error => {
            console.error(`Failed to create table 'categories': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableItems(sql).catch(error => {
            console.error(`Failed to create table 'items': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableItemCategories(sql).catch(error => {
            console.error(`Failed to create table 'item_categories': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTablePendingItemChanges(sql).catch(error => {
            console.error(`Failed to create table 'pending_item_changes': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableItemAssets(sql).catch(error => {
            console.error(`Failed to create table 'pending_item_changes': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableUsers(sql).catch(error => {
            console.error(`Failed to create table 'pending_item_changes': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    try {
        await sql.begin(async (): Promise<void> => await schema.createTableSessions(sql).catch(error => {
            console.error(`Failed to create table 'pending_item_changes': ${error}`);
        }))
    } catch (error: any | {severity_local: string, severity: string, code: string, message: string, file: string, line: string, routine: string}) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    console.log(`Successfully created all tables.`)
}