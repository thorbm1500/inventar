import {env} from "$env/dynamic/private";
import mysql, {type Connection, type ConnectionOptions} from 'mysql2/promise';
import type {Session} from "$lib/server/db/schema";
import currencies from "$lib/server/db/components/currencies";
import colors from "$lib/server/db/components/colors";

export const sql: Connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT) ?? undefined,
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    timezone: env.DB_TIMEZONE,
    supportBigNumbers: true
} as ConnectionOptions);

export interface DatabaseResult {
    success: boolean,
    result?: any,
    message?: string
}

class Internal {
    static async execute(query: string, params?: any[] | {}): Promise<DatabaseResult> {
        try {
            const [results] = await sql.execute(query, params ?? []);
            return {success: true, result: results};
        } catch (error) {
            console.error(error);
            return {success: false, message: String(error)};
        }
    }
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
    await Internal.execute(`CREATE TABLE IF NOT EXISTS currencies
                            (
                                id     VARCHAR(3) UNIQUE NOT NULL,
                                code   VARCHAR(3) UNIQUE NOT NULL,
                                symbol VARCHAR(255) DEFAULT NULL,
                                PRIMARY KEY (id)
                            )`);

    for (const row of currencies) {
        await Internal.execute(`INSERT IGNORE INTO currencies (id, code)
                                VALUES (?, ?)`, [row.id, row.code])
    }
}

/**
 * Creates the table 'inventories', if it doesn't already exist.
 * If the table creation is successful; Adds foreign key constraint on table 'users'.
 */
export async function createTableInventories(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS inventories
                            (
                                uuid        VARCHAR(36) UNIQUE  NOT NULL DEFAULT UUID(),
                                owner       VARCHAR(36)         NOT NULL,
                                name        VARCHAR(255) UNIQUE NOT NULL,
                                description TEXT                         DEFAULT NULL,
                                item_amount BIGINT              NOT NULL DEFAULT 0,
                                last_update BIGINT              NOT NULL DEFAULT UNIX_TIMESTAMP(),
                                created_at  BIGINT              NOT NULL DEFAULT UNIX_TIMESTAMP(),
                                PRIMARY KEY (uuid),
                                FOREIGN KEY (owner) REFERENCES users (uuid)
                            )`)

    await Internal.execute(`ALTER TABLE users
        ADD CONSTRAINT users_inventory_fk
            FOREIGN KEY (primary_inventory) references inventories (uuid)`);

    //todo: Sync item amount every midnight, to ensure correct amount.
    /*
    todo: If account of owner is attempted deleted;
     Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
     */
}

export async function createTableInventoryAccessList(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS inventory_access_list
                            (
                                inventory        VARCHAR(36) NOT NULL,
                                user_uuid        VARCHAR(36) NOT NULL,
                                edit_inventory   BOOLEAN     NOT NULL DEFAULT FALSE,
                                delete_inventory BOOLEAN     NOT NULL DEFAULT FALSE,
                                view_items       BOOLEAN     NOT NULL DEFAULT FALSE,
                                create_items     BOOLEAN     NOT NULL DEFAULT FALSE,
                                edit_items       BOOLEAN     NOT NULL DEFAULT FALSE,
                                delete_items     BOOLEAN     NOT NULL DEFAULT FALSE,
                                view_users       BOOLEAN     NOT NULL DEFAULT FALSE,
                                add_users        BOOLEAN     NOT NULL DEFAULT FALSE,
                                edit_users       BOOLEAN     NOT NULL DEFAULT FALSE,
                                remove_users     BOOLEAN     NOT NULL DEFAULT FALSE,
                                view_audit       BOOLEAN     NOT NULL DEFAULT FALSE,
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
    await Internal.execute(`CREATE TABLE IF NOT EXISTS labels
                            (
                                inventory VARCHAR(36)        NOT NULL,
                                uuid      VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
                                name      VARCHAR(255)       NOT NULL,
                                color     INTEGER            NOT NULL DEFAULT 1,
                                PRIMARY KEY (inventory, uuid),
                                FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE
                            )`);
}

/**
 * Creates the table 'categories', if it doesn't already exist.
 */
export async function createTableLabelColors(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS label_colors
                            (
                                id              INTEGER UNIQUE NOT NULL,
                                border          VARCHAR(9)     NOT NULL,
                                background      VARCHAR(9)     NOT NULL,
                                dark_border     VARCHAR(9)     NOT NULL,
                                dark_background VARCHAR(9)     NOT NULL,
                                PRIMARY KEY (id)
                            )`);

    for (const row of colors) {
        await Internal.execute(`INSERT IGNORE INTO label_colors (id, border, background, dark_border, dark_background)
                                VALUES (?, ?, ?, ?, ?)`, [row.id, row.border, row.background, row.dark_border, row.dark_background]);
    }
}

/**
 * Creates the table 'items', if it doesn't already exist.
 */
export async function createTableItems(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS items
                            (
                                inventory           VARCHAR(36)        NOT NULL,
                                uuid                VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
                                name                VARCHAR(255)       NOT NULL,
                                description         TEXT                        DEFAULT NULL,
                                amount              BIGINT             NOT NULL DEFAULT 0,
                                reserved_amount     BIGINT             NOT NULL DEFAULT 0,
                                pending_amount      BIGINT             NOT NULL DEFAULT 0,
                                reserved_expiration BIGINT                      DEFAULT NULL,
                                pending_expiration  BIGINT                      DEFAULT NULL,
                                image               TEXT                        DEFAULT NULL,
                                url                 TEXT                        DEFAULT NULL,
                                price               NUMERIC(50, 2)     NOT NULL DEFAULT 0.0,
                                currency            VARCHAR(3)         NOT NULL DEFAULT 'DKK',
                                created_by          VARCHAR(36)        NOT NULL,
                                last_update         BIGINT             NOT NULL DEFAULT UNIX_TIMESTAMP(),
                                created_at          BIGINT             NOT NULL DEFAULT UNIX_TIMESTAMP(),
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
    await Internal.execute(`CREATE TABLE IF NOT EXISTS item_labels
                            (
                                inventory VARCHAR(36) NOT NULL,
                                item      VARCHAR(36) NOT NULL,
                                label     VARCHAR(36) NOT NULL,
                                PRIMARY KEY (inventory, item, label),
                                FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE,
                                FOREIGN KEY (item) REFERENCES items (uuid) ON DELETE CASCADE,
                                FOREIGN KEY (label) REFERENCES labels (uuid)
                            )`);
}

/**
 * Creates the table 'users', if it doesn't already exist.
 */
export async function createTableUsers(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS users
                            (
                                uuid              VARCHAR(36) UNIQUE  NOT NULL DEFAULT UUID(),
                                email             VARCHAR(255) UNIQUE NOT NULL,
                                password_hash     TEXT                NOT NULL,
                                username          VARCHAR(255) UNIQUE NOT NULL,
                                profile_picture   TEXT                         DEFAULT NULL,
                                reset_token       TEXT UNIQUE                  DEFAULT NULL,
                                primary_inventory VARCHAR(36)                  DEFAULT NULL,
                                last_login        BIGINT              NOT NULL DEFAULT UNIX_TIMESTAMP(),
                                created_at        BIGINT              NOT NULL DEFAULT UNIX_TIMESTAMP(),
                                superuser         BOOLEAN             NOT NULL DEFAULT false,
                                PRIMARY KEY (uuid)
                            )`);
}

/**
 * Creates the table 'sessions', if it doesn't already exist.
 */
export async function createTableSessions(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS sessions
                            (
                                uuid       VARCHAR(36) UNIQUE NOT NULL,
                                session_id TEXT UNIQUE        NOT NULL,
                                expires    BIGINT             NOT NULL,
                                PRIMARY KEY (uuid),
                                FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
                            )`);
}

/**
 * Creates the table 'reset_tokens', if it doesn't already exist.
 */
export async function createTableResetTokens(): Promise<void> {
    await Internal.execute(`CREATE TABLE IF NOT EXISTS reset_tokens
              (
                  uuid    VARCHAR(36) UNIQUE NOT NULL,
                  token   TEXT UNIQUE NOT NULL,
                  expires BIGINT      NOT NULL,
                  PRIMARY KEY (uuid),
                  FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
              )`);
}

export async function getCurrencies(): Promise<DatabaseResult> {
    return await Internal.execute(`SELECT *
                                   FROM currencies`);
}

export class Inventories {
    /**
     * Creates a new inventory.
     * @param owner UUID of the account that is creating the inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(owner: string, name: string, description?: string): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT IGNORE INTO inventories(owner, name, description)
                                       VALUES (?, ?, ?);
        SELECT *
        FROM inventories
        ORDER BY created_at DESC
        LIMIT 1;`, [owner, name, description ?? null]);
    }

    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
                                       LIMIT ? OFFSET ?`, [amount, offset]);
    }

    static async fetchTotalInventoryCount(): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT COUNT(uuid) AS amount
                                       FROM inventories`);
    }

    static async fetchInventoryByUuid(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM inventories
                                       WHERE uuid = ?`, [uuid]);
    }
}

export class Categories {
    static async create(name: string, description?: string): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT IGNORE INTO categories (name, description)
                                       VALUES (?, ?);
        SELECT *
        FROM categories
        ORDER BY created_at DESC
        LIMIT 1`, [name, description ?? null]);
    }
}

export class Items {
    /* todo Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string, amount: number = 0, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT IGNORE INTO items (inventory, name, description, amount, image, url, price, currency)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                SELECT *
                FROM items
                ORDER BY created_at DESC`,
            [inventory, name, description ?? null, amount, image ?? null, url ?? null, price, currency]);
    }

    static async fetch(amount: number = 15, order_by: string, order: string, offset: number = 0): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM inventories ${order_by === '' ? `` : `ORDER BY ${order_by} ${order === 'ASC' ? `ASC` : `DESC`}`}
                                       LIMIT ? OFFSET ?`, [amount, offset]);
    }

    static async fetchTotalItemCount(inventory: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT COUNT(uuid) AS amount
                                       FROM items
                                       WHERE inventory = ?`, [inventory])
    }

    static async deleteItem(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`DELETE
                                       FROM items
                                       WHERE uuid = ?`, [uuid])
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
    static async create(email: string, username: string, password_hash: string, superuser: boolean = false): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT INTO users (email, username, password_hash, superuser)
                                       VALUES (?, ?, ?, ?);
        SELECT uuid
        FROM users
        ORDER BY created_at DESC
        LIMIT 1`, [email, username, password_hash, superuser])
    }

    static async getFromUuid(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM users
                                       WHERE uuid = ?`, [uuid]);
    }

    static async getFromEmail(email: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM users
                                       WHERE email = ?`, [email]);
    }

    static async getPasswordHash(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT password_hash
                                       FROM users
                                       WHERE uuid = ?`, [uuid]);
    }

    static async setPasswordHash(uuid: string, passwordHash: string): Promise<DatabaseResult> {
        return await Internal.execute(`UPDATE users
                                       SET password_hash = ?
                                       WHERE uuid = ?`, [passwordHash, uuid]);
    }

    static async updateLastLogin(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`UPDATE users
                                       SET last_login = UNIX_TIMESTAMP()
                                       WHERE uuid = ?`, [uuid]);
    }

    static async getUserAmount(): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT count(uuid) as amount
                                       FROM users`);
    }
}

export class Auth {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async newSession(session: Session): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT INTO sessions (uuid, session_id, expires)
                                       VALUES (?, ?, ?)
                                       ON DUPLICATE KEY UPDATE session_id = $2,
                                                               expires    = $3`, [session.uuid, session.session_id, session.expires]);
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM sessions
                                       WHERE session_id = ?`, [session_id]);
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id Id of session to renew.
     * @param expires New expiration date.
     */
    static async renewSession(session_id: string, expires: number): Promise<DatabaseResult> {
        return await Internal.execute(`UPDATE sessions
                                       SET expires = ?
                                       WHERE session_id = ?`, [expires, session_id]);
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<DatabaseResult> {
        return await Internal.execute(`DELETE
                                       FROM sessions
                                       WHERE session_id = ?`, [session_id]);
    }

    static async getResetToken(token: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM reset_tokens
                                       WHERE token = ?`, [token]);
    }

    static async getResetTokenFromUuid(uuid: string): Promise<DatabaseResult> {
        return await Internal.execute(`SELECT *
                                       FROM reset_tokens
                                       WHERE uuid = ?`, [uuid]);
    }

    static async setResetToken(uuid: string, token: string, expires: number): Promise<DatabaseResult> {
        return await Internal.execute(`INSERT INTO reset_tokens(uuid, token, expires)
                                       VALUES (?, ?, ?)
                                       ON DUPLICATE KEY UPDATE token   = $2,
                                                               expires = $3`, [uuid, token, expires]);
    }

    static async deleteResetToken(token: string): Promise<DatabaseResult> {
        return await Internal.execute(`DELETE
                                       FROM reset_tokens
                                       WHERE token = ?`, [token]);
    }
}

export default {Inventories, Categories, Items, Users, Auth};