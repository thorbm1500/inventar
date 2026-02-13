import {env} from "$env/dynamic/private";
import Log from '$lib/server/internal/log';
import mysql, {type Pool, type PoolConnection, type RowDataPacket} from 'mysql2/promise';
import type {Currency, Inventory, Item, ResetRequest, Session, User} from "$lib/server/db/schema";
import currencies from "$lib/server/db/components/currencies";
import colors from "$lib/server/db/components/colors";

const pool: Pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT) ?? undefined,
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    supportBigNumbers: true,
    connectionLimit: 20
});

export async function getConnection(): Promise<PoolConnection> {
    return await pool.getConnection();
}

/**
 * Creates all the default tables, in the database, and adds the table's default values, if any.
 */
export async function createTables(): Promise<void> {
    Log.info(`Creating database tables.`)
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
    Log.done(`Table creation finished.`)
}

/**
 * Creates the table 'currencies', if it doesn't already exist.
 */
export async function createTableCurrencies(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists currencies
                              (
                                  id     varchar(3)   not null
                                      primary key,
                                  code   varchar(3)   not null,
                                  symbol varchar(255) null,
                                  constraint code
                                      unique (code),
                                  constraint id
                                      unique (id)
                              )`);

    for (const row of currencies) {
        await connection.execute(`INSERT IGNORE INTO currencies (id, code)
                                  VALUES (?, ?)`, [row.id, row.code])
    }

    connection.release();
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * If the table creation is successful; Adds foreign key constraint on table 'users'.
 */
export async function createTableInventories(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists inventories
                              (
                                  uuid        char(36)  default (uuid())          not null
                                      primary key,
                                  owner       char(36)                            not null,
                                  name        varchar(255)                        not null,
                                  description text                                null,
                                  item_amount bigint    default 0                 not null,
                                  last_update timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
                                  created_at  timestamp default CURRENT_TIMESTAMP not null
                              )`)

    connection.release();
    //todo: Sync item amount every midnight, to ensure correct amount.
    /*
    todo: If account of owner is attempted deleted;
     Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
     */
}

export async function createTableInventoryAccessList(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists inventory_access_list
                              (
                                  inventory        char(36)             not null,
                                  user_uuid        char(36)             not null,
                                  edit_inventory   tinyint(1) default 0 not null,
                                  delete_inventory tinyint(1) default 0 not null,
                                  view_items       tinyint(1) default 0 not null,
                                  create_items     tinyint(1) default 0 not null,
                                  edit_items       tinyint(1) default 0 not null,
                                  delete_items     tinyint(1) default 0 not null,
                                  view_users       tinyint(1) default 0 not null,
                                  add_users        tinyint(1) default 0 not null,
                                  edit_users       tinyint(1) default 0 not null,
                                  remove_users     tinyint(1) default 0 not null,
                                  view_audit       tinyint(1) default 0 not null,
                                  primary key (inventory, user_uuid),
                                  constraint inventory_access_list_ibfk_1
                                      foreign key (inventory) references inventories (uuid)
                                          on delete cascade,
                                  constraint inventory_access_list_ibfk_2
                                      foreign key (user_uuid) references users (uuid)
                                          on delete cascade
                              )`);

    connection.release();
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabels(): Promise<void> {
    //todo: Expand to allow for custom colors in the future.
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists labels
                              (
                                  inventory char(36)                          not null,
                                  uuid      char(36)         default (uuid()) not null,
                                  name      varchar(255)                      not null,
                                  color     tinyint unsigned default '1'      not null,
                                  primary key (inventory, uuid),
                                  constraint labels_pk
                                      unique (uuid),
                                  constraint labels_ibfk_1
                                      foreign key (inventory) references inventories (uuid)
                                          on delete cascade
                              )`);

    connection.release();
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabelColors(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists label_colors
                              (
                                  id              int        not null
                                      primary key,
                                  border          varchar(9) not null,
                                  background      varchar(9) not null,
                                  dark_border     varchar(9) not null,
                                  dark_background varchar(9) not null,
                                  constraint id
                                      unique (id)
                              )`);

    for (const row of colors) {
        await connection.execute(`INSERT IGNORE INTO label_colors (id, border, background, dark_border, dark_background)
                                  VALUES (?, ?, ?, ?, ?)`, [row.id, row.border, row.background, row.dark_border, row.dark_background]);
    }

    connection.release();
}

/**
 * Creates the table 'items', if it doesn't already exist.
 */
export async function createTableItems(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists items
                              (
                                  inventory           char(36)                                 not null,
                                  uuid                char(36)       default (uuid())          not null,
                                  name                varchar(255)                             not null,
                                  description         text                                     null,
                                  amount              bigint         default 0                 not null,
                                  reserved_amount     bigint         default 0                 not null,
                                  pending_amount      bigint         default 0                 not null,
                                  reserved_expiration bigint                                   null,
                                  pending_expiration  bigint                                   null,
                                  image               text                                     null,
                                  url                 text                                     null,
                                  price               decimal(50, 2) default 0.00              not null,
                                  currency            varchar(3)     default 'DKK'             not null,
                                  created_by          char(36)                                 not null,
                                  last_update         timestamp      default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
                                  created_at          timestamp      default CURRENT_TIMESTAMP not null,
                                  primary key (inventory, uuid),
                                  constraint items_pk
                                      unique (uuid),
                                  constraint items_ibfk_1
                                      foreign key (inventory) references inventories (uuid)
                                          on delete cascade,
                                  constraint items_ibfk_2
                                      foreign key (currency) references currencies (code),
                                  constraint items_ibfk_3
                                      foreign key (created_by) references users (uuid)
                              )`);

    connection.release();
}

/**
 * Creates the table 'item_categories', if it doesn't already exist.
 */
export async function createTableItemLabels(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists item_labels
                              (
                                  inventory char(36) not null,
                                  item      char(36) not null,
                                  label     char(36) not null,
                                  primary key (inventory, item, label),
                                  constraint item_labels_ibfk_1
                                      foreign key (inventory) references inventories (uuid)
                                          on delete cascade,
                                  constraint item_labels_ibfk_2
                                      foreign key (item) references items (uuid)
                                          on delete cascade,
                                  constraint item_labels_ibfk_3
                                      foreign key (label) references labels (uuid)
                                          on delete cascade
                              )`);

    connection.release();
}

/**
 * Creates the table 'users', if it doesn't already exist.
 */
export async function createTableUsers(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists users
                              (
                                  uuid              char(36)   default (uuid())          not null
                                      primary key,
                                  email             varchar(255)                         not null,
                                  password_hash     text                                 not null,
                                  username          varchar(255)                         not null,
                                  profile_picture   text                                 null,
                                  reset_token       text                                 null,
                                  primary_inventory char(36)                             null,
                                  last_login        timestamp  default CURRENT_TIMESTAMP not null,
                                  created_at        timestamp  default CURRENT_TIMESTAMP not null,
                                  superuser         tinyint(1) default 0                 not null,
                                  constraint users_inventory_fk
                                      foreign key (primary_inventory) references inventories (uuid)
                              )`);

    await connection.execute(`ALTER TABLE inventories
        ADD CONSTRAINT inventories_owner_fk
            FOREIGN KEY (owner) REFERENCES users (uuid)`)

    connection.release();
}

/**
 * Creates the table 'sessions', if it doesn't already exist.
 */
export async function createTableSessions(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists sessions
                              (
                                  uuid       char(36)     not null
                                      primary key,
                                  session_id varchar(255) not null,
                                  expires    bigint       not null,
                                  constraint sessions_ibfk_1
                                      foreign key (uuid) references users (uuid)
                                          on delete cascade
                              )`);

    connection.release();
}

/**
 * Creates the table 'reset_tokens', if it doesn't already exist.
 */
export async function createTableResetTokens(): Promise<void> {
    const connection: PoolConnection = await getConnection();

    await connection.execute(`create table if not exists reset_tokens
                              (
                                  uuid    char(36)     not null
                                      primary key,
                                  token   varchar(255) not null,
                                  expires bigint       not null,
                                  constraint reset_tokens_ibfk_1
                                      foreign key (uuid) references users (uuid)
                                          on delete cascade
                              )`);

    connection.release();
}

export async function getCurrencies(): Promise<Currency[]> {
    const connection: PoolConnection = await getConnection();

    const [result] = await connection.query(`SELECT *
                                             FROM currencies`
    );
    connection.release();
    return result as Currency[];
}

export class Inventories {
    /**
     * Creates a new inventory.
     * @param owner UUID of the account that is creating the inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(owner: string, name: string, description?: string): Promise<Inventory> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`INSERT IGNORE INTO inventories(owner, name, description)
                                  VALUES (?, ?, ?)`, [owner, name, description ?? null]);

        const [result] = await connection.query(`SELECT *
                                                 FROM inventories
                                                 WHERE owner = ?
                                                 ORDER BY created_at DESC
                                                 LIMIT 1`, [owner]);

        connection.release();
        return (result as Inventory[])[0];
    }

    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<Inventory[]> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
                                                 LIMIT ? OFFSET ?`, [amount, offset]
        );

        connection.release();
        return result as Inventory[];
    }

    static async fetchTotalInventoryCount(): Promise<number> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT COUNT(uuid) AS amount
                                                 FROM inventories`);

        connection.release();
        return (result as RowDataPacket[])[0].amount ?? 0;
    }

    static async fetchInventoryByUuid(uuid: string): Promise<Inventory> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM inventories
                                                 WHERE uuid = ?`, [uuid]);

        connection.release();
        return (result as Inventory[])[0];
    }
}

export class Items {
    /* todo Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string, amount: number = 0, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<Item | undefined> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`INSERT IGNORE INTO items (inventory, name, description, amount, image, url, price, currency)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [inventory, name, description ?? null, amount, image ?? null, url ?? null, price, currency]);

        const [result] = await connection.query(`SELECT *
                                                 FROM items
                                                 ORDER BY created_at DESC`);

        connection.release();
        return (result as Item[])[0] ?? undefined;
    }

    static async fetch(amount: number = 15, order_by: string, order: string, offset: number = 0): Promise<Item[]> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
                                                 LIMIT ? OFFSET ?`, [amount, offset]);

        connection.release();
        return result as Item[];
    }

    static async fetchTotalItemCount(inventory: string): Promise<number> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT COUNT(uuid) AS amount
                                                 FROM items
                                                 WHERE inventory = ?`, [inventory]);

        connection.release();
        return (result as RowDataPacket[])[0].amount ?? 1;
    }

    static async deleteItem(uuid: string): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`DELETE
                                  FROM items
                                  WHERE uuid = ?`, [uuid]);

        connection.release();
    }
}

export class Users {
    /**
     * Creates a new user in the database, and returns the new user's uuid.
     * @param email The user's email.
     * @param username The user's username.
     * @param password_hash A hashed version of the user's password.
     * @param superuser If the user should have administrator rights.
     */
    static async create(email: string, username: string, password_hash: string, superuser: boolean = false): Promise<User> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`INSERT INTO users (email, username, password_hash, superuser)
                                  VALUES (?, ?, ?, ?)`, [email, username, password_hash, superuser]);

        const [result] = await connection.query(`SELECT *
                                                 FROM users
                                                 WHERE email = ?
                                                   AND username = ?
                                                 ORDER BY created_at DESC
                                                 LIMIT 1`, [email, username]
        );

        connection.release();
        return (result as User[])[0];
    }

    static async getFromUuid(uuid: string): Promise<User | undefined> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM users
                                                 WHERE uuid = ?`, [uuid]);

        connection.release();
        return (result as User[])[0] ?? undefined;
    }

    static async getFromEmail(email: string): Promise<User> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM users
                                                 WHERE email = ?`, [email]);

        connection.release();
        return (result as User[])[0];
    }

    static async getPasswordHash(uuid: string): Promise<string> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT password_hash
                                                 FROM users
                                                 WHERE uuid = ?`, [uuid]);

        connection.release();
        return (result as RowDataPacket[])[0].password_hash ?? '';
    }

    static async setPasswordHash(uuid: string, passwordHash: string): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`UPDATE users
                                  SET password_hash = ?
                                  WHERE uuid = ?`, [passwordHash, uuid]);

        connection.release();
    }

    static async updateLastLogin(uuid: string): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`UPDATE users
                                  SET last_login = UNIX_TIMESTAMP()
                                  WHERE uuid = ?`, [uuid]);

        connection.release();
    }

    static async getUserAmount(): Promise<number> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT count(uuid) as amount
                                                 FROM users`);

        connection.release();
        return (result as RowDataPacket[])[0].amount ?? 1;
    }
}

export class Auth {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async newSession(session: Session): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`INSERT INTO sessions (uuid, session_id, expires)
                                  VALUES (?, ?, ?)
                                  ON DUPLICATE KEY UPDATE session_id = ?,
                                                          expires    = ?`, [session.uuid, session.session_id, session.expires, session.session_id, session.expires]);

        connection.release();
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session | undefined> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM sessions
                                                 WHERE session_id = ?`, [session_id]);
        return (result as Session[])[0] ?? undefined;
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id Id of session to renew.
     * @param expires New expiration date.
     */
    static async renewSession(session_id: string, expires: number): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`UPDATE sessions
                                  SET expires = ?
                                  WHERE session_id = ?`, [expires, session_id]);

        connection.release();
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`DELETE
                                  FROM sessions
                                  WHERE session_id = ?`, [session_id]);

        connection.release();
    }

    static async getResetRequest(token: string): Promise<ResetRequest | undefined> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(
            `SELECT *
             FROM reset_tokens
             WHERE token = ?`, [token]
        );

        connection.release();
        return (result as ResetRequest[])[0] ?? undefined;
    }

    static async getResetRequestFromUuid(uuid: string): Promise<ResetRequest | undefined> {
        const connection: PoolConnection = await getConnection();

        const [result] = await connection.query(`SELECT *
                                                 FROM reset_tokens
                                                 WHERE uuid = ?`, [uuid]);

        connection.release();
        return (result as ResetRequest[])[0] ?? undefined;
    }

    static async setResetToken(uuid: string, token: string, expires: number): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`INSERT INTO reset_tokens(uuid, token, expires)
                                  VALUES (?, ?, ?)
                                  ON DUPLICATE KEY UPDATE token   = ?,
                                                          expires = ?`, [uuid, token, expires, token, expires]);

        connection.release();
    }

    static async deleteResetToken(token: string): Promise<void> {
        const connection: PoolConnection = await getConnection();

        await connection.execute(`DELETE
                                  FROM reset_tokens
                                  WHERE token = ?`, [token]);

        connection.release();
    }
}

export default {Inventories, Items, Users, Auth};