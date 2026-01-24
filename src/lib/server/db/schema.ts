import postgres from "postgres";
import currencies from "$lib/server/db/currencies";

/**
 * Creates the table 'currencies', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableCurrencies(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS currencies
              (
                  code   VARCHAR(3) NOT NULL UNIQUE,
                  number VARCHAR(3) NOT NULL UNIQUE,
                  symbol VARCHAR(255) DEFAULT NULL,
                  CONSTRAINT currencies_pkey PRIMARY KEY (code, number)
              )`.then(async (): Promise<void> => {
        for (const index of currencies) {
            console.log(`INSERTING code: ${index.code} & number: ${index.number}`)
            await sql`INSERT INTO currencies(code, number)
                      VALUES (${index.code}, ${index.number})
                      ON CONFLICT DO NOTHING`;
        }
    })
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableInventories(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS inventories
              (
                  inventory_uuid UUID         NOT NULL UNIQUE DEFAULT uuidv7(),
                  name           VARCHAR(255) NOT NULL,
                  description    TEXT                  DEFAULT NULL,
                  CONSTRAINT inventories_pkey PRIMARY KEY (inventory_uuid)
              )`;
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableCategories(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS categories
              (
                  category_uuid  UUID         NOT NULL UNIQUE DEFAULT uuidv7(),
                  inventory_uuid UUID         NOT NULL,
                  name           VARCHAR(255) NOT NULL,
                  description    TEXT                  DEFAULT NULL,
                  CONSTRAINT categories_pkey PRIMARY KEY (category_uuid, inventory_uuid),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE
              )`;
}

/**
 * Creates the table 'items', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableItems(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS items
              (
                  item_uuid   UUID         NOT NULL UNIQUE DEFAULT uuidv7(),
                  name        VARCHAR(255) NOT NULL,
                  description TEXT                  DEFAULT NULL,
                  url         VARCHAR(255)          DEFAULT NULL,
                  assets_path VARCHAR(255)          DEFAULT NULL,
                  price       BIGINT       NOT NULL,
                  currency    VARCHAR(3)            DEFAULT 'DKK',
                  amount      BIGINT                DEFAULT 0,
                  CONSTRAINT items_pkey PRIMARY KEY (item_uuid),
                  FOREIGN KEY (currency) REFERENCES currencies(code) ON DELETE CASCADE
              )`;
}

/**
 * Creates the table 'item_categories', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableItemCategories(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS item_categories
              (
                  inventory_uuid UUID NOT NULL,
                  item_uuid      UUID NOT NULL,
                  category_uuid  UUID NOT NULL,
                  CONSTRAINT item_categories_pkey PRIMARY KEY (inventory_uuid, item_uuid, category_uuid),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (item_uuid) REFERENCES items (item_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (category_uuid) REFERENCES categories (category_uuid) ON DELETE CASCADE
              )`;
}

/**
 * Creates the table 'pending_item_changes', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTablePendingItemChanges(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS pending_item_changes
              (
                  inventory_uuid UUID NOT NULL,
                  item_uuid      UUID NOT NULL,
                  in_order       BIGINT DEFAULT 0,
                  reserved       BIGINT DEFAULT 0,
                  CONSTRAINT pending_item_changes_pkey PRIMARY KEY (inventory_uuid, item_uuid),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (item_uuid) REFERENCES items (item_uuid) ON DELETE CASCADE
              )`;
}