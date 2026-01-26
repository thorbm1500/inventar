import { sql } from "$lib/server/db/database";
import * as schema from "$lib/server/db/schema";

/**
 * Initializes the database, and ensures that the default schema is present.
 */
export default async function initializeDatabase(): Promise<void> {
    console.log(`Initializing database...`)
    try {
        await createTables();
        //console.log("Creating test inventory.")
        //await Inventories.create("3D Print");
        //await Inventories.create("Components");
    } catch(error) {
        console.error(error);
    }
}

/**
 * Creates all the default tables, in the database,
 * and adds the table's default values, if any.
 */
async function createTables(): Promise<void> {
    console.log(`Creating database 'currencies'...`)
    try {
        await sql.begin(async (): Promise<void> => {
            await schema.createTableCurrencies(sql).catch(error => {
                console.error(`Failed to create table 'currencies': ${error}`);
            });
            await schema.createTableInventories(sql).catch(error => {
                console.error(`Failed to create table 'inventories': ${error}`);
            });
            await schema.createTableCategories(sql).catch(error => {
                console.error(`Failed to create table 'categories': ${error}`);
            });
            await schema.createTableItems(sql).catch(error => {
                console.error(`Failed to create table 'items': ${error}`);
            });
            await schema.createTableItemCategories(sql).catch(error => {
                console.error(`Failed to create table 'item_categories': ${error}`);
            });
            await schema.createTablePendingItemChanges(sql).catch(error => {
                console.error(`Failed to create table 'pending_item_changes': ${error}`);
            });
        })
    } catch (error) {
        console.error(`Failed to create tables. Error: ${error}`);
        return;
    }
    console.log(`Successfully created all tables.`)
}