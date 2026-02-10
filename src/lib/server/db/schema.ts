import {sql} from "$lib/server/db/database";
import currencies from '$lib/server/db/components/currencies';
import colors from '$lib/server/db/components/colors'

export interface Currency {
    id: string,
    code: string,
    symbol?: string | null
}

/**
 * Creates the table 'currencies', if it doesn't already exist.
 */
export async function createTableCurrencies(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS currencies
              (
                  id     VARCHAR(3) UNIQUE NOT NULL,
                  code   VARCHAR(3) UNIQUE NOT NULL,
                  symbol VARCHAR(255) DEFAULT NULL,
                  CONSTRAINT currencies_pkey PRIMARY KEY (id)
              )`
        .then(async () => {
            for (const row of currencies) {
                await sql`INSERT INTO currencies (id, code)
                          VALUES (${row.id}, ${row.code})
                          ON CONFLICT (id) DO NOTHING`
                    .catch(error => console.error(error))
            }
        })
        .catch(error => console.error(error));
}

export interface Inventory {
    uuid: string,
    owner: string,
    name: string,
    description?: string,
    image_path?: string,
    item_amount: number,
    labels: Label[],
    last_update: number,
    created_at: number
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * If the table creation is successful; Adds foreign key constraint on table 'users'.
 */
export async function createTableInventories(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS inventories
              (
                  uuid        UUID UNIQUE         NOT NULL DEFAULT uuidv7(),
                  owner       UUID                NOT NULL,
                  name        VARCHAR(255) UNIQUE NOT NULL,
                  description TEXT                         DEFAULT NULL,
                  item_amount BIGINT              NOT NULL DEFAULT 0,
                  last_update BIGINT              NOT NULL DEFAULT extract(epoch FROM now()),
                  created_at  BIGINT              NOT NULL DEFAULT extract(epoch FROM now()),
                  CONSTRAINT inventories_pkey PRIMARY KEY (uuid),
                  FOREIGN KEY (owner) REFERENCES users (uuid)
              )`
        .then(async () => {
            await sql`ALTER TABLE users
                ADD CONSTRAINT users_inventory_fk
                    FOREIGN KEY (primary_inventory) references inventories (uuid)`
                .catch(() => {})
        })
        .catch(error => console.error(error));
    //todo: Sync item amount every midnight, to ensure correct amount.
    /*
    todo: If account of owner is attempted deleted;
     Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
     */
}

export interface userInventoryPermissions {
    inventory: string,
    user_uuid: string,
    edit_inventory: boolean,
    delete_inventory: boolean,
    view_items: boolean,
    create_items: boolean,
    edit_items: boolean,
    delete_items: boolean,
    view_users: boolean,
    add_users: boolean,
    edit_users: boolean,
    remove_users: boolean,
    view_audit: boolean
}

export async function createTableInventoryAccessList(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS inventory_access_list
              (
                  inventory        UUID    NOT NULL,
                  user_uuid        UUID    NOT NULL,
                  edit_inventory   BOOLEAN NOT NULL DEFAULT FALSE,
                  delete_inventory BOOLEAN NOT NULL DEFAULT FALSE,
                  view_items       BOOLEAN NOT NULL DEFAULT FALSE,
                  create_items     BOOLEAN NOT NULL DEFAULT FALSE,
                  edit_items       BOOLEAN NOT NULL DEFAULT FALSE,
                  delete_items     BOOLEAN NOT NULL DEFAULT FALSE,
                  view_users       BOOLEAN NOT NULL DEFAULT FALSE,
                  add_users        BOOLEAN NOT NULL DEFAULT FALSE,
                  edit_users       BOOLEAN NOT NULL DEFAULT FALSE,
                  remove_users     BOOLEAN NOT NULL DEFAULT FALSE,
                  view_audit       BOOLEAN NOT NULL DEFAULT FALSE,
                  CONSTRAINT inventory_access_list_pkey PRIMARY KEY (inventory, user_uuid),
                  FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                  FOREIGN KEY (user_uuid) REFERENCES users (uuid) ON DELETE CASCADE
              )`
        .catch(error => console.error(error));
}

export interface Label {
    inventory: string,
    uuid: string,
    name: string,
    color_id: 1,
    colors: LabelColors | undefined
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabels(): Promise<void> {
    //todo: Expand to allow for custom colors in the future.
    await sql`CREATE TABLE IF NOT EXISTS labels
              (
                  inventory UUID         NOT NULL,
                  uuid      UUID UNIQUE  NOT NULL DEFAULT uuidv7(),
                  name      VARCHAR(255) NOT NULL,
                  color     INTEGER      NOT NULL DEFAULT 1,
                  CONSTRAINT labels_pkey PRIMARY KEY (inventory, uuid),
                  FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE
              )`
        .catch(error => console.error(error));
}

export interface LabelColors {
    id: number,
    border: string,
    background: string,
    dark_border: string,
    dark_background: string
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabelColors(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS label_colors
              (
                  id              INTEGER UNIQUE NOT NULL,
                  border          VARCHAR(9)     NOT NULL,
                  background      VARCHAR(9)     NOT NULL,
                  dark_border     VARCHAR(9)     NOT NULL,
                  dark_background VARCHAR(9)     NOT NULL,
                  CONSTRAINT label_colors_pkey PRIMARY KEY (id)
              )`
        .then(async () => {
            for (const row of colors) {
                await sql`INSERT INTO label_colors (id, border, background, dark_border, dark_background)
                          VALUES (${row.id}, ${row.border}, ${row.background}, ${row.dark_border}, ${row.dark_background})
                          ON CONFLICT (id) DO UPDATE
                              SET border=${row.border},
                                  background=${row.background},
                                  dark_border=${row.dark_border},
                                  dark_background=${row.dark_background}`
                    .catch(error => console.error(error))
            }
        })
        .catch(error => console.error(error));
}

export interface Item {
    inventory: string,
    uuid: string,
    name: string,
    description?: string,
    amount: number,
    image?: string,
    url?: string,
    price: number,
    currency: string,
    labels: Label[],
    last_update: number,
    created_at: number
}

/**
 * Creates the table 'items', if it doesn't already exist.
 */
export async function createTableItems(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS items
              (
                  inventory           UUID           NOT NULL,
                  uuid                UUID UNIQUE    NOT NULL DEFAULT uuidv7(),
                  name                VARCHAR(255)   NOT NULL,
                  description         TEXT                    DEFAULT NULL,
                  amount              BIGINT         NOT NULL DEFAULT 0,
                  reserved_amount     BIGINT         NOT NULL DEFAULT 0,
                  pending_amount      BIGINT         NOT NULL DEFAULT 0,
                  reserved_expiration BIGINT                  DEFAULT NULL,
                  pending_expiration  BIGINT                  DEFAULT NULL,
                  image               TEXT                    DEFAULT NULL,
                  url                 TEXT                    DEFAULT NULL,
                  price               NUMERIC(50, 2) NOT NULL DEFAULT 0.0,
                  currency            VARCHAR(3)     NOT NULL DEFAULT 'DKK',
                  created_by          UUID           NOT NULL,
                  last_update         BIGINT         NOT NULL DEFAULT extract(epoch FROM now()),
                  created_at          BIGINT         NOT NULL DEFAULT extract(epoch FROM now()),
                  CONSTRAINT items_pkey PRIMARY KEY (inventory, uuid),
                  FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                  FOREIGN KEY (currency) REFERENCES currencies (code),
                  FOREIGN KEY (created_by) REFERENCES users (uuid)
              )`
        .catch(error => console.error(error));
}

/**
 * Creates the table 'item_categories', if it doesn't already exist.
 */
export async function createTableItemLabels(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS item_labels
              (
                  inventory UUID NOT NULL,
                  item      UUID NOT NULL,
                  label     UUID NOT NULL,
                  CONSTRAINT item_categories_pkey PRIMARY KEY (inventory, item, label),
                  FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                  FOREIGN KEY (item) REFERENCES items (uuid) ON DELETE CASCADE,
                  FOREIGN KEY (label) REFERENCES labels (uuid) ON DELETE CASCADE
              )`
        .catch(error => console.error(error));
}

/**
 * User interface, to easily handle user data. The User interface should never contain or be able to contain any sensitive data.
 */
export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture?: string,
    primary_inventory?: string,
    last_login: number,
    created_at: number,
    superuser: boolean
}

/**
 * Creates the table 'users', if it doesn't already exist.
 */
export async function createTableUsers(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS users
              (
                  uuid              UUID UNIQUE         NOT NULL DEFAULT uuidv7(),
                  email             varchar(255) UNIQUE NOT NULL,
                  password_hash     TEXT                NOT NULL,
                  username          varchar(255) UNIQUE NOT NULL,
                  profile_picture   TEXT                         DEFAULT NULL,
                  reset_token       TEXT UNIQUE                  DEFAULT NULL,
                  primary_inventory UUID                         DEFAULT NULL,
                  last_login        BIGINT              NOT NULL DEFAULT extract(epoch FROM now()),
                  created_at        BIGINT              NOT NULL DEFAULT extract(epoch FROM now()),
                  superuser         BOOLEAN             NOT NULL DEFAULT false,
                  CONSTRAINT users_pkey PRIMARY KEY (uuid)
              )`
        .catch(error => console.error(error));
}

export interface Session {
    uuid: string,
    session_id: string,
    expires: number
}

/**
 * Creates the table 'sessions', if it doesn't already exist.
 */
export async function createTableSessions(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS sessions
              (
                  uuid       UUID UNIQUE NOT NULL,
                  session_id TEXT UNIQUE NOT NULL,
                  expires    BIGINT      NOT NULL,
                  CONSTRAINT sessions_pkey PRIMARY KEY (uuid),
                  FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
              )`
        .catch(error => console.error(error));
}

export interface ResetRequest {
    uuid: string,
    token: string,
    expires: number
}

/**
 * Creates the table 'reset_tokens', if it doesn't already exist.
 */
export async function createTableResetTokens(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS reset_tokens
              (
                  uuid    UUID UNIQUE NOT NULL,
                  token   TEXT UNIQUE NOT NULL,
                  expires BIGINT      NOT NULL,
                  CONSTRAINT reset_tokens_pkey PRIMARY KEY (uuid),
                  FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
              )`
        .catch(error => console.error(error));
}

/**
 * Creates all the default tables, in the database, and adds the table's default values, if any.
 */
export async function createTables(): Promise<void> {
    console.log(`Table creation starting...`)
    await createTableCurrencies();
    await createTableUsers();
    await createTableInventories();
    await createTableInventoryAccessList();
    await createTableLabels();
    await createTableLabelColors();
    await createTableItems();
    await createTableItemLabels();
    await createTableSessions();
    await createTableResetTokens();
    console.log(`Table creation finished.`)
}