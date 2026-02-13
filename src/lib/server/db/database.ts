import {env} from "$env/dynamic/private";
import mysql, {type Connection, type ConnectionOptions} from 'mysql2/promise';
import type {Currency, Inventory, Item, ResetRequest, Session, User} from "$lib/server/db/schema";
import currencies from "$lib/server/db/components/currencies";
import colors from "$lib/server/db/components/colors";
import type {RowDataPacket} from "mysql2";

export const sql: Connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT) ?? undefined,
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    supportBigNumbers: true
} as ConnectionOptions);

export interface DatabaseResult {
    success: boolean,
    result?: any,
    message?: string
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

/**
 * Creates the table 'currencies', if it doesn't already exist.
 */
export async function createTableCurrencies(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS currencies
                       (
                           id     VARCHAR(3) NOT NULL,
                           code   VARCHAR(3) NOT NULL,
                           symbol VARCHAR(255) DEFAULT NULL,
                           PRIMARY KEY (id)
                       )`);

    for (const row of currencies) {
        await sql.execute(`INSERT IGNORE INTO currencies (id, code)
                           VALUES (?, ?)`, [row.id, row.code])
    }
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * If the table creation is successful; Adds foreign key constraint on table 'users'.
 */
export async function createTableInventories(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS inventories
                       (
                           uuid        CHAR(36)     NOT NULL DEFAULT (UUID()),
                           owner       CHAR(36)     NOT NULL,
                           name        VARCHAR(255) NOT NULL,
                           description TEXT(255)             DEFAULT NULL,
                           item_amount BIGINT(255)  NOT NULL DEFAULT 0,
                           last_update BIGINT(255)  NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           created_at  BIGINT(255)  NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           PRIMARY KEY (uuid),
                           FOREIGN KEY (owner) REFERENCES users (uuid)
                       )`)

    //todo: Sync item amount every midnight, to ensure correct amount.
    /*
    todo: If account of owner is attempted deleted;
     Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
     */
}

export async function createTableInventoryAccessList(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS inventory_access_list
                       (
                           inventory        CHAR(36) NOT NULL,
                           user_uuid        CHAR(36) NOT NULL,
                           edit_inventory   BOOLEAN  NOT NULL DEFAULT FALSE,
                           delete_inventory BOOLEAN  NOT NULL DEFAULT FALSE,
                           view_items       BOOLEAN  NOT NULL DEFAULT FALSE,
                           create_items     BOOLEAN  NOT NULL DEFAULT FALSE,
                           edit_items       BOOLEAN  NOT NULL DEFAULT FALSE,
                           delete_items     BOOLEAN  NOT NULL DEFAULT FALSE,
                           view_users       BOOLEAN  NOT NULL DEFAULT FALSE,
                           add_users        BOOLEAN  NOT NULL DEFAULT FALSE,
                           edit_users       BOOLEAN  NOT NULL DEFAULT FALSE,
                           remove_users     BOOLEAN  NOT NULL DEFAULT FALSE,
                           view_audit       BOOLEAN  NOT NULL DEFAULT FALSE,
                           PRIMARY KEY (inventory, user_uuid),
                           FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                           FOREIGN KEY (user_uuid) REFERENCES users (uuid) ON DELETE CASCADE
                       )`);
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabels(): Promise<void> {
    //todo: Expand to allow for custom colors in the future.
    await sql.execute(`CREATE TABLE IF NOT EXISTS labels
                       (
                           inventory CHAR(36)              NOT NULL,
                           uuid      CHAR(36) UNIQUE       NOT NULL DEFAULT (UUID()),
                           name      VARCHAR(255)          NOT NULL,
                           color     TINYINT(255) UNSIGNED NOT NULL DEFAULT 1,
                           PRIMARY KEY (inventory, uuid),
                           FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE
                       )`);
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabelColors(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS label_colors
                       (
                           id              TINYINT(255) UNSIGNED NOT NULL,
                           border          CHAR(9)               NOT NULL,
                           background      CHAR(9)               NOT NULL,
                           dark_border     CHAR(9)               NOT NULL,
                           dark_background CHAR(9)               NOT NULL,
                           PRIMARY KEY (id)
                       )`);

    for (const row of colors) {
        await sql.execute(`INSERT IGNORE INTO label_colors (id, border, background, dark_border, dark_background)
                           VALUES (?, ?, ?, ?, ?)`, [row.id, row.border, row.background, row.dark_border, row.dark_background]);
    }
}

/**
 * Creates the table 'items', if it doesn't already exist.
 */
export async function createTableItems(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS items
                       (
                           inventory           CHAR(36)        NOT NULL,
                           uuid                CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
                           name                VARCHAR(255)    NOT NULL,
                           description         TEXT(255)                DEFAULT NULL,
                           amount              BIGINT(255)     NOT NULL DEFAULT 0,
                           reserved_amount     BIGINT(255)     NOT NULL DEFAULT 0,
                           pending_amount      BIGINT(255)     NOT NULL DEFAULT 0,
                           reserved_expiration BIGINT(255)              DEFAULT NULL,
                           pending_expiration  BIGINT(255)              DEFAULT NULL,
                           image               TEXT(255)                DEFAULT NULL,
                           url                 TEXT(255)                DEFAULT NULL,
                           price               NUMERIC(50, 2)  NOT NULL DEFAULT 0.0,
                           currency            VARCHAR(3)      NOT NULL DEFAULT 'DKK',
                           created_by          CHAR(36)        NOT NULL,
                           last_update         BIGINT(255)     NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           created_at          BIGINT(255)     NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           PRIMARY KEY (inventory, uuid),
                           FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                           FOREIGN KEY (currency) REFERENCES currencies (code),
                           FOREIGN KEY (created_by) REFERENCES users (uuid)
                       )`);
}

/**
 * Creates the table 'item_categories', if it doesn't already exist.
 */
export async function createTableItemLabels(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS item_labels
                       (
                           inventory CHAR(36) NOT NULL,
                           item      CHAR(36) NOT NULL,
                           label     CHAR(36) NOT NULL,
                           PRIMARY KEY (inventory, item, label),
                           FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                           FOREIGN KEY (item) REFERENCES items (uuid) ON DELETE CASCADE,
                           FOREIGN KEY (label) REFERENCES labels (uuid) ON DELETE CASCADE
                       )`);
}

/**
 * Creates the table 'users', if it doesn't already exist.
 */
export async function createTableUsers(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS users
                       (
                           uuid              CHAR(36)     NOT NULL DEFAULT (UUID()),
                           email             VARCHAR(255) NOT NULL,
                           password_hash     TEXT(255)    NOT NULL,
                           username          VARCHAR(255) NOT NULL,
                           profile_picture   TEXT(255)             DEFAULT NULL,
                           reset_token       TEXT(255)             DEFAULT NULL,
                           primary_inventory CHAR(36)              DEFAULT NULL,
                           last_login        BIGINT(255)  NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           created_at        BIGINT(255)  NOT NULL DEFAULT (UNIX_TIMESTAMP()),
                           superuser         BOOLEAN      NOT NULL DEFAULT false,
                           PRIMARY KEY (uuid)
                       )`);
}

/**
 * Creates the table 'sessions', if it doesn't already exist.
 */
export async function createTableSessions(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS sessions
                       (
                           uuid       CHAR(36)     NOT NULL,
                           session_id VARCHAR(255) NOT NULL,
                           expires    BIGINT(255)  NOT NULL,
                           PRIMARY KEY (uuid),
                           FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
                       )`);
}

/**
 * Creates the table 'reset_tokens', if it doesn't already exist.
 */
export async function createTableResetTokens(): Promise<void> {
    await sql.execute(`CREATE TABLE IF NOT EXISTS reset_tokens
                       (
                           uuid    CHAR(36)     NOT NULL,
                           token   VARCHAR(255) NOT NULL,
                           expires BIGINT(255)  NOT NULL,
                           PRIMARY KEY (uuid),
                           FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
                       )`);
}

export async function getCurrencies(): Promise<Currency[]> {
    const [result] = await sql.execute<Currency[]>(
        `SELECT *
         FROM currencies`
    );
    return result;
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
        await sql.execute(
            `INSERT IGNORE INTO inventories(owner, name, description)
             VALUES (?, ?, ?)`
        );

        const [result] = await sql.execute<Inventory[]>(
            `SELECT *
             FROM inventories
             ORDER BY created_at DESC
             LIMIT 1;`, [owner, name, description ?? null]
        );
        return result[0];
    }

    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<Inventory[]> {
        const [result] = await sql.execute<Inventory[]>(
            `SELECT *
             FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
             LIMIT ? OFFSET ?`, [amount, offset]
        );
        return result;
    }

    static async fetchTotalInventoryCount(): Promise<number> {
        const [result] = await sql.execute<RowDataPacket[]>(
            `SELECT COUNT(uuid) AS amount
             FROM inventories`
        );
        return result[0].amount;
    }

    static async fetchInventoryByUuid(uuid: string): Promise<Inventory> {
        const [result] = await sql.execute<Inventory[]>(
            `SELECT *
             FROM inventories
             WHERE uuid = ?`, [uuid]
        );
        return result[0];
    }
}

export class Items {
    /* todo Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string, amount: number = 0, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<Item> {
        await sql.execute<Item[]>(
            `INSERT IGNORE INTO items (inventory, name, description, amount, image, url, price, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [inventory, name, description ?? null, amount, image ?? null, url ?? null, price, currency]
        );

        const [result] = await sql.execute<Item[]>(
            `SELECT *
             FROM items
             ORDER BY created_at DESC`, []
        );
        return result[0];
    }

    static async fetch(amount: number = 15, order_by: string, order: string, offset: number = 0): Promise<Item[]> {
        const [result] = await sql.execute<Item[]>(
            `SELECT *
             FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
             LIMIT ? OFFSET ?`, [amount, offset]
        );
        return result;
    }

    static async fetchTotalItemCount(inventory: string): Promise<number> {
        const [result] = await sql.execute<RowDataPacket[]>(
            `SELECT COUNT(uuid) AS amount
             FROM items
             WHERE inventory = ?`, [inventory]
        );
        return result[0].amount;
    }

    static async deleteItem(uuid: string): Promise<void> {
        await sql.execute(
            `DELETE
             FROM items
             WHERE uuid = ?`, [uuid]
        );
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
        await sql.execute(
            `INSERT INTO users (email, username, password_hash, superuser)
             VALUES (?, ?, ?, ?)`, [email, username, password_hash, superuser]
        );

        const [result] = await sql.execute<User[]>(
            `SELECT uuid
             FROM users
             ORDER BY created_at DESC
             LIMIT 1`
        );
        return result[0];
    }

    static async getFromUuid(uuid: string): Promise<User> {
        const [result] = await sql.execute<User[]>(
            `SELECT *
             FROM users
             WHERE uuid = ?`,
            [uuid]
        );
        return result[0];
    }

    static async getFromEmail(email: string): Promise<User> {
        const [result] = await sql.execute<User[]>(
            `SELECT *
             FROM users
             WHERE email = ?`,
            [email]
        );
        return result[0];
    }

    static async getPasswordHash(uuid: string): Promise<string> {
        const [result] = await sql.execute<RowDataPacket[]>(
            `SELECT password_hash
             FROM users
             WHERE uuid = ?`,
            [uuid]
        );
        return result[0].password_hash;
    }

    static async setPasswordHash(uuid: string, passwordHash: string): Promise<void> {
        await sql.execute(
            `UPDATE users
             SET password_hash = ?
             WHERE uuid = ?`, [passwordHash, uuid]
        );
    }

    static async updateLastLogin(uuid: string): Promise<void> {
        await sql.execute(`UPDATE users
                           SET last_login = UNIX_TIMESTAMP()
                           WHERE uuid = ?`, [uuid]
        );
    }

    static async getUserAmount(): Promise<number> {
        const [result] = await sql.execute<RowDataPacket[]>(
            `SELECT count(uuid) as amount
             FROM users`
        );
        return result[0].amount;
    }
}

export class Auth {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async newSession(session: Session): Promise<void> {
        await sql.execute(`INSERT INTO sessions (uuid, session_id, expires)
                           VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE session_id = $2,
                                                   expires    = $3`, [session.uuid, session.session_id, session.expires]
        );
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session> {
        const [result] = await sql.execute<Session[]>(
            `SELECT *
             FROM sessions
             WHERE session_id = ?`, [session_id]
        );
        return result[0];
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id Id of session to renew.
     * @param expires New expiration date.
     */
    static async renewSession(session_id: string, expires: number): Promise<void> {
        await sql.execute(
            `UPDATE sessions
             SET expires = ?
             WHERE session_id = ?`, [expires, session_id]
        );
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        await sql.execute(
            `DELETE
             FROM sessions
             WHERE session_id = ?`, [session_id]
        );
    }

    static async getResetToken(token: string): Promise<ResetRequest> {
        const [result] = await sql.execute<ResetRequest[]>(
            `SELECT *
             FROM reset_tokens
             WHERE token = ?`, [token]
        );
        return result[0];
    }

    static async getResetTokenFromUuid(uuid: string): Promise<ResetRequest> {
        const [result] = await sql.execute<ResetRequest[]>(
            `SELECT *
             FROM reset_tokens
             WHERE uuid = ?`, [uuid]
        );
        return result[0];
    }

    static async setResetToken(uuid: string, token: string, expires: number): Promise<void> {
        await sql.execute(
            `INSERT INTO reset_tokens(uuid, token, expires)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE token   = $2,
                                     expires = $3`, [uuid, token, expires]
        );
    }

    static async deleteResetToken(token: string): Promise<void> {
        await sql.execute(
            `DELETE
             FROM reset_tokens
             WHERE token = ?`, [token]
        );
    }
}

export default {Inventories, Items, Users, Auth};