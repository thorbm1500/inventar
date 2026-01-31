import postgres from "postgres";
import currencies from "$lib/server/db/currencies";

function isValidError(error: any): boolean {
    if (!error) return false;

    return !(error.severity && error.severity == "NOTICE");
}

/**
 * Creates the table 'currencies', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableCurrencies(sql: postgres.Sql): Promise<void> {
    try {
        await sql`CREATE TABLE IF NOT EXISTS currencies
              (
                  code   VARCHAR(3) UNIQUE NOT NULL,
                  number VARCHAR(3) UNIQUE NOT NULL,
                  symbol VARCHAR(255) DEFAULT NULL,
                  CONSTRAINT currencies_pkey PRIMARY KEY (code, number)
              )`.then(async (): Promise<void> => {
            for (const index of currencies) {
                await sql`INSERT INTO currencies(code, number)
                      VALUES (${index.code}, ${index.number})
                      ON CONFLICT DO NOTHING`;
            }
        })
    } catch (error) {
        if (isValidError(error)) {
            console.log("TRUE");
            console.error(error);
        } else {
            console.log("FALSE");
        }
    }
}

export interface Inventory {
    inventory_uuid: string,
    name: string,
    description: string | null,
    image_path: string | null,
    item_amount: number,
    last_update: Date | string,
    default_inventory: boolean
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableInventories(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS inventories
              (
                  inventory_uuid    UUID UNIQUE         NOT NULL DEFAULT uuidv7(),
                  name              VARCHAR(255) UNIQUE NOT NULL,
                  description       TEXT                         DEFAULT NULL,
                  image_path        TEXT UNIQUE                  DEFAULT NULL,
                  item_amount       BIGINT              NOT NULL DEFAULT 0,
                  last_update       TIMESTAMP           NOT NULL DEFAULT now(),
                  default_inventory BOOLEAN                      DEFAULT FALSE,
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
                  inventory_uuid UUID         NOT NULL,
                  category_uuid  UUID UNIQUE  NOT NULL DEFAULT uuidv7(),
                  name           VARCHAR(255) NOT NULL,
                  description    TEXT                  DEFAULT NULL,
                  CONSTRAINT categories_pkey PRIMARY KEY (inventory_uuid, category_uuid),
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
                  inventory_uuid UUID           NOT NULL,
                  item_uuid      UUID UNIQUE    NOT NULL DEFAULT uuidv7(),
                  name           VARCHAR(255)   NOT NULL,
                  description    TEXT                    DEFAULT NULL,
                  amount         BIGINT         NOT NULL DEFAULT 0,
                  thumbnail_path TEXT UNIQUE             DEFAULT NULL,
                  url            TEXT                    DEFAULT NULL,
                  price          NUMERIC(50, 2) NOT NULL DEFAULT 0.0,
                  currency_code  VARCHAR(3)     NOT NULL DEFAULT 'DKK',
                  created_at     TIMESTAMP      NOT NULL DEFAULT now(),
                  last_modified  TIMESTAMP      NOT NULL DEFAULT now(),
                  CONSTRAINT items_pkey PRIMARY KEY (inventory_uuid, item_uuid),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (currency_code) REFERENCES currencies (code)
              )`.then(async (): Promise<void> => {
    });
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
    await sql`CREATE TABLE IF NOT EXISTS item_amount_specifications
              (
                  inventory_uuid     UUID   NOT NULL,
                  item_uuid          UUID   NOT NULL,
                  reserved           BIGINT NOT NULL DEFAULT 0,
                  pending            BIGINT NOT NULL DEFAULT 0,
                  pending_expiration TIMESTAMP       DEFAULT NULL,
                  CONSTRAINT pending_item_changes_pkey PRIMARY KEY (inventory_uuid, item_uuid),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (item_uuid) REFERENCES items (item_uuid) ON DELETE CASCADE
              )`;
}

/** todo: For later use. Will be implemented if item will have the ability to have multiple images, other than the thumbnail.
 * Creates the table 'item_assets', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableItemAssets(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS item_assets
              (
                  inventory_uuid UUID        NOT NULL,
                  item_uuid      UUID        NOT NULL,
                  image_path     TEXT UNIQUE NOT NULL,
                  CONSTRAINT item_assets_pkey PRIMARY KEY (inventory_uuid, item_uuid, image_path),
                  FOREIGN KEY (inventory_uuid) REFERENCES inventories (inventory_uuid) ON DELETE CASCADE,
                  FOREIGN KEY (item_uuid) REFERENCES items (item_uuid) ON DELETE CASCADE
              )`
}

export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture: string,
    created_at: string,
    last_login: string,
    superuser: boolean
}

/**
 * Creates the table 'users', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableUsers(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS users
              (
                  uuid            UUID UNIQUE  NOT NULL DEFAULT uuidv7(),
                  email           varchar(255) NOT NULL,
                  password_hash   TEXT         NOT NULL,
                  username        varchar(255) NOT NULL,
                  profile_picture TEXT                  DEFAULT NULL,
                  reset_token     TEXT                  DEFAULT NULL,
                  created_at      TIMESTAMP    NOT NULL DEFAULT now(),
                  last_login      TIMESTAMP    NOT NULL DEFAULT now(),
                  CONSTRAINT users_pkey PRIMARY KEY (uuid)
              )`;
}

export interface Session {
    uuid: string,
    session_id: string,
    expires: number
}

/**
 * Creates the table 'sessions', if it doesn't already exist.
 * @param sql The database connection on which to perform the query.
 */
export async function createTableSessions(sql: postgres.Sql): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS sessions
              (
                  uuid       UUID UNIQUE NOT NULL,
                  session_id TEXT UNIQUE NOT NULL,
                  expires    BIGINT      NOT NULL,
                  CONSTRAINT sessions_pkey PRIMARY KEY (uuid),
                  FOREIGN KEY (uuid) REFERENCES users (uuid)
              )`;
}