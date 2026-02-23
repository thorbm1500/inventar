import {env} from "$env/dynamic/private";
import Log from '$lib/server/internal/log';
import {v7 as uuidv7, validate} from 'uuid';
import mysql, {type Pool, type RowDataPacket} from 'mysql2/promise';
import type {Currency, Inventory, Item, PageTheme, ResetRequest, Session, User} from "$lib/server/db/interfaces";
import currencies from "$lib/server/db/components/currencies";
import colors from "$lib/server/db/components/colors";
import {UserSettings} from "$lib/components/settings/UserSettings";
import type {Setting} from "$lib/components/settings/GenericSettings.svelte";
import {type ApplicationSetting, type ApplicationSettings, defaultSettings, emptyApplicationSettingsObj} from "$lib/server/db/components/ApplicationSettingsDefaults";

export const connection: Pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT) ?? 3306,
    database: env.DB_DATABASE ?? 'inventar',
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    supportBigNumbers: true,
    connectionLimit: 20
});

/**
 * todo
 */
export async function init(): Promise<void> {
    Log.info(`Initializing database...`);
    const startTime: number = Date.now();

    await ensureTables();
    await ensureConstraints();
    await ensureDefaultValues();

    Log.done(`Database initialization completed. [${Date.now() - startTime}ms]`)
}

/**
 * Ensures all tables are present in the database.
 */
async function ensureTables(): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS application_settings
                            (
                                category       VARCHAR(60)          NOT NULL,
                                subcategory    VARCHAR(60)          NOT NULL,
                                setting        VARCHAR(60)          NOT NULL,
                                text_value     VARCHAR(255)         NULL,
                                textarea_value TEXT                 NULL,
                                toggle_value   TINYINT(1) DEFAULT 0 NOT NULL,
                                PRIMARY KEY (category, subcategory, setting)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'application_settings'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS currencies
                            (
                                id     CHAR(3)     NOT NULL,
                                code   CHAR(3)     NOT NULL,
                                format VARCHAR(18) NOT NULL,
                                PRIMARY KEY (id),
                                CONSTRAINT currencies_code_u
                                    UNIQUE (code),
                                CONSTRAINT currencies_id_u
                                    UNIQUE (id)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'currencies'`, err));

    /*
   todo: If account of owner is attempted deleted;
    Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
    */
    await connection.query(`CREATE TABLE IF NOT EXISTS inventories
                            (
                                uuid        CHAR(36)                            NOT NULL,
                                owner       CHAR(36)                            NOT NULL,
                                name        VARCHAR(64)                         NOT NULL,
                                description TEXT(255)                           NULL,
                                last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                PRIMARY KEY (uuid),
                                CONSTRAINT inventories_uuid_u
                                    UNIQUE (uuid)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'inventories'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS inventory_settings
                            (
                                uuid        CHAR(36)                   NOT NULL,
                                category    VARCHAR(24)                NOT NULL,
                                subcategory VARCHAR(24)                NOT NULL,
                                type        VARCHAR(24)                NOT NULL,
                                title       VARCHAR(32)                NOT NULL,
                                subtitle    TINYTEXT                   NULL,
                                value       VARCHAR(255)               NOT NULL,
                                readonly    TINYINT(1)       DEFAULT 0 NOT NULL,
                                \`order\`   TINYINT UNSIGNED DEFAULT 0 NOT NULL,
                                PRIMARY KEY (uuid, category, subcategory, title),
                                CONSTRAINT inventory_settings_uuid_fk
                                    FOREIGN KEY (uuid) REFERENCES inventories (uuid) ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'inventory_settings'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS users
                            (
                                uuid              CHAR(36)                             NOT NULL,
                                email             VARCHAR(254)                         NOT NULL,
                                password_hash     VARCHAR(100)                         NOT NULL,
                                username          VARCHAR(64)                          NOT NULL,
                                profile_picture   VARCHAR(2000)                        NULL,
                                reset_token       CHAR(36)                             NULL,
                                primary_inventory CHAR(36)                             NULL,
                                preferred_theme   VARCHAR(5) DEFAULT 'dark'            NOT NULL,
                                last_login        TIMESTAMP  DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                created_at        TIMESTAMP  DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                superuser         TINYINT(1) DEFAULT 0                 NOT NULL,
                                PRIMARY KEY (uuid),
                                CONSTRAINT users_uuid_u
                                    UNIQUE (uuid),
                                CONSTRAINT users_primary_inventory_fk
                                    FOREIGN KEY (primary_inventory) REFERENCES inventories (uuid)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'users'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS user_settings
                            (
                                uuid              CHAR(36)                   NOT NULL,
                                category          VARCHAR(24)                NOT NULL,
                                subcategory       VARCHAR(24)                NOT NULL,
                                type              VARCHAR(24)                NOT NULL,
                                title             VARCHAR(32)                NOT NULL,
                                subtitle          TINYTEXT                   NULL,
                                value             VARCHAR(255)               NOT NULL,
                                readonly          TINYINT(1)       DEFAULT 0 NOT NULL,
                                category_order    TINYINT UNSIGNED DEFAULT 0 NOT NULL,
                                subcategory_order TINYINT UNSIGNED DEFAULT 0 NOT NULL,
                                setting_order     TINYINT UNSIGNED DEFAULT 0 NOT NULL,
                                PRIMARY KEY (uuid, category, subcategory, title),
                                CONSTRAINT user_settings_uuid_fk
                                    FOREIGN KEY (uuid) REFERENCES users (uuid) ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'user_settings'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS inventory_access
                            (
                                inventory        CHAR(36)             NOT NULL,
                                user             CHAR(36)             NOT NULL,
                                edit_inventory   TINYINT(1) DEFAULT 0 NOT NULL,
                                delete_inventory TINYINT(1) DEFAULT 0 NOT NULL,
                                view_items       TINYINT(1) DEFAULT 0 NOT NULL,
                                create_items     TINYINT(1) DEFAULT 0 NOT NULL,
                                edit_items       TINYINT(1) DEFAULT 0 NOT NULL,
                                delete_items     TINYINT(1) DEFAULT 0 NOT NULL,
                                view_users       TINYINT(1) DEFAULT 0 NOT NULL,
                                add_users        TINYINT(1) DEFAULT 0 NOT NULL,
                                edit_users       TINYINT(1) DEFAULT 0 NOT NULL,
                                remove_users     TINYINT(1) DEFAULT 0 NOT NULL,
                                view_audit       TINYINT(1) DEFAULT 0 NOT NULL,
                                PRIMARY KEY (inventory, user),
                                CONSTRAINT inventory_access_inventory_fk
                                    FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                                        ON DELETE CASCADE,
                                CONSTRAINT inventory_access_user_fk
                                    FOREIGN KEY (user) REFERENCES users (uuid)
                                        ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'inventory_access'`, err));

    //todo: Expand to allow for custom colors in the future.
    await connection.query(`CREATE TABLE IF NOT EXISTS labels
                            (
                                inventory CHAR(36)                         NOT NULL,
                                uuid      CHAR(36)                         NOT NULL,
                                name      VARCHAR(32)                      NOT NULL,
                                color     TINYINT(24) UNSIGNED DEFAULT '1' NOT NULL,
                                PRIMARY KEY (inventory, uuid),
                                CONSTRAINT labels_uuid_u
                                    UNIQUE (uuid),
                                CONSTRAINT labels_inventory_fk
                                    FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                                        ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'labels'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS default_label_colors
                            (
                                id              TINYINT(24) NOT NULL,
                                border          CHAR(9)     NOT NULL,
                                background      CHAR(9)     NOT NULL,
                                dark_border     CHAR(9)     NOT NULL,
                                dark_background CHAR(9)     NOT NULL,
                                PRIMARY KEY (id),
                                CONSTRAINT default_label_colors_id_u
                                    UNIQUE (id)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'default_label_colors'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS items
                            (
                                inventory           CHAR(36)                                 NOT NULL,
                                uuid                CHAR(36)                                 NOT NULL,
                                name                VARCHAR(120)                             NOT NULL,
                                description         TEXT(255)                                NULL,
                                amount              INT(255)       DEFAULT 0                 NOT NULL,
                                reserved_amount     INT(255)       DEFAULT 0                 NOT NULL,
                                pending_amount      INT(255)       DEFAULT 0                 NOT NULL,
                                reserved_expiration TIMESTAMP                                NULL,
                                pending_expiration  TIMESTAMP                                NULL,
                                image               VARCHAR(2000)                            NULL,
                                url                 VARCHAR(2000)                            NULL,
                                price               DECIMAL(50, 2) DEFAULT 0.00              NOT NULL,
                                currency            CHAR(3)        DEFAULT 'N/A'             NOT NULL,
                                part_number         VARCHAR(32)                              NULL,
                                created_by          CHAR(36)                                 NOT NULL,
                                last_update         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                                created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                PRIMARY KEY (inventory, uuid),
                                CONSTRAINT items_uuid_u
                                    UNIQUE (uuid),
                                CONSTRAINT items_inventory_fk
                                    FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                                        ON DELETE CASCADE,
                                CONSTRAINT items_currency_fk
                                    FOREIGN KEY (currency) REFERENCES currencies (code),
                                CONSTRAINT items_created_by_fk
                                    FOREIGN KEY (created_by) REFERENCES users (uuid)
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'items'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS item_labels
                            (
                                inventory CHAR(36) NOT NULL,
                                item      CHAR(36) NOT NULL,
                                label     CHAR(36) NOT NULL,
                                PRIMARY KEY (inventory, item, label),
                                CONSTRAINT item_labels_inventory_fk
                                    FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                                        ON DELETE CASCADE,
                                CONSTRAINT item_labels_item_fk
                                    FOREIGN KEY (item) REFERENCES items (uuid)
                                        ON DELETE CASCADE,
                                CONSTRAINT item_labels_label_fk
                                    FOREIGN KEY (label) REFERENCES labels (uuid)
                                        ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'item_labels'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS sessions
                            (
                                uuid          CHAR(36)                                                  NOT NULL,
                                session_id    VARCHAR(255)                                              NOT NULL,
                                ip            VARCHAR(39)                                               NULL,
                                continent     VARCHAR(56) DEFAULT 'Unknown'                             NULL,
                                country       VARCHAR(56) DEFAULT 'Unknown'                             NULL,
                                region        VARCHAR(56) DEFAULT 'Unknown'                             NULL,
                                city          VARCHAR(56) DEFAULT 'Unknown'                             NULL,
                                device        VARCHAR(8)  DEFAULT 'Unknown'                             NULL,
                                platform      VARCHAR(10) DEFAULT 'Unknown'                             NULL,
                                last_accessed TIMESTAMP   DEFAULT CURRENT_TIMESTAMP                     NOT NULL,
                                created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP                     NOT NULL,
                                expires       TIMESTAMP   DEFAULT (ADDTIME(CURRENT_TIMESTAMP, "7 0:0")) NOT NULL,
                                PRIMARY KEY (uuid, session_id),
                                CONSTRAINT sessions_uuid_fk
                                    FOREIGN KEY (uuid) REFERENCES users (uuid)
                                        ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'sessions'`, err));

    await connection.query(`CREATE TABLE IF NOT EXISTS reset_tokens
                            (
                                uuid    CHAR(36)                                               NOT NULL,
                                token   VARCHAR(255)                                           NOT NULL,
                                expires TIMESTAMP DEFAULT (ADDTIME(CURRENT_TIMESTAMP, "15:0")) NOT NULL,
                                PRIMARY KEY (uuid),
                                CONSTRAINT reset_tokens_uuid_fk
                                    FOREIGN KEY (uuid) REFERENCES users (uuid)
                                        ON DELETE CASCADE
                            )`).catch((err: Error): void => Log.error(`Failed to create table 'reset_tokens'`, err));
}

/**
 * Ensures all table constraint are in place. Some constraints are unable to be created when creating the tables,
 * due to cross-references between the tables. If possible, a constraint is defined when the table is created,
 * otherwise the constraint will be created when this method is called.
 */
async function ensureConstraints(): Promise<void> {
    const [existingConstraint] = await connection.query(`SELECT CONSTRAINT_NAME as name,
                                                                CONSTRAINT_TYPE as type
                                                         FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                                                         WHERE TABLE_SCHEMA = 'inventar'
                                                           AND TABLE_NAME = 'inventories'
                                                           AND CONSTRAINT_NAME = 'inventories_owner_fk'`)
        .catch((err: Error): [] => {
            Log.error(`Failed to select existing constraints`, err);
            return [];
        });

    if (!existingConstraint || (existingConstraint as RowDataPacket[]).length === 0) {
        await connection.query(`ALTER TABLE inventories
            ADD CONSTRAINT inventories_owner_fk
                FOREIGN KEY (owner) REFERENCES users (uuid)`)
            .catch((err: Error): [] => {
                Log.error(`Failed to add constraint 'fk_owner' to table 'inventories'`, err);
                return [];
            });
    }
}

/**
 * Ensures all default values are present in the database.
 */
async function ensureDefaultValues(): Promise<void> {
    /**
     * When attempting to insert values by iterating through lists or other iterable objects, try/catch is preferred. This
     * is to not flood the console/logs in case of a connection failure or similar. One failure to stop the entire
     * iteration and insertion process.
     */

    try {
        for (const setting of defaultSettings) {
            await connection.execute(`INSERT IGNORE INTO application_settings (category, subcategory, setting, text_value, textarea_value, toggle_value)
                                      VALUES (?, ?, ?, ?, ?, ?)`,
                [setting.category, setting.subcategory, setting.setting, setting.text_value, setting.textarea_value, setting.toggle_value ? '1' : '0']);
        }
    } catch (err) {
        Log.error(`Failed to add default values to table 'application_settings'`, err as Error);
    }

    try {
        for (const row of currencies) {
            await connection.execute(`INSERT INTO currencies (id, code, format)
                                      VALUES (?, ?, ?)
                                      ON DUPLICATE KEY UPDATE code=?,
                                                              format=?`,
                [row.id, row.code, row.format ?? '%value%', row.code, row.format ?? '%value%']);
        }
    } catch (err) {
        Log.error(`Failed to add default values to table 'currencies'`, err as Error);
    }

    try {
        for (const row of currencies) {
            await connection.execute(`INSERT INTO currencies (id, code, format)
                                      VALUES (?, ?, ?)
                                      ON DUPLICATE KEY UPDATE code=?,
                                                              format=?`,
                [row.id, row.code, row.format ?? '%value%', row.code, row.format ?? '%value%']);
        }
    } catch (err) {
        Log.error(`Failed to add default values to table 'currencies'`, err as Error);
    }

    try {
        for (const row of colors) {
            await connection.execute(`INSERT INTO default_label_colors (id, border, background, dark_border, dark_background)
                                      VALUES (?, ?, ?, ?, ?)
                                      ON DUPLICATE KEY UPDATE border=?,
                                                              background=?,
                                                              dark_border=?,
                                                              dark_background=?`,
                [row.id, row.border, row.background, row.dark_border, row.dark_background, row.border, row.background, row.dark_border, row.dark_background]);
        }
    } catch (err) {
        Log.error(`Failed to add default values to table 'default_label_colors'`, err as Error);
    }
}

/**
 * todo
 */
export async function getApplicationSettings(): Promise<ApplicationSettings> {
    const [result] = await connection.execute(`SELECT *
                                             FROM application_settings`)
        .catch((err: Error): [] => {
            Log.error(`getApplicationSettings[0]: Database request failed`, err);
            return [];
        });

    const settings: ApplicationSettings = emptyApplicationSettingsObj;

    for(const row of result as RowDataPacket[]) {
        const setting: ApplicationSetting = row as ApplicationSetting;
        if(!setting.category || !setting.subcategory || !setting.setting) continue;

        settings.get(setting.category)?.get(setting.subcategory)?.set(setting.setting,setting as ApplicationSetting);
    }

    return settings;
}

/**
 * todo
 */
export async function getCurrencies(): Promise<Currency[]> {
    const [result] = await connection.query(`SELECT *
                                             FROM currencies
                                             ORDER BY code ASC`)
        .catch((err: Error): [] => {
            Log.error(`getCurrencies[0]: Database request failed`, err);
            return [];
        });

    return result as Currency[];
}

/**
 * todo
 */
export class Inventories {
    /**
     * Creates a new inventory.
     * @param owner UUID of the account that is creating the inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(owner: string, name: string, description?: string): Promise<Inventory | undefined> {
        const uuid: string = uuidv7();

        await connection.execute(`INSERT INTO inventories(uuid, owner, name, description)
                                  VALUES (?, ?, ?, ?)`, [uuid, owner, name, description ?? null])
            .catch((err: Error): void => Log.error(`Inventories#create[0]: Database request failed`, err));

        const [result] = await connection.execute(`SELECT *
                                                   FROM inventories
                                                   WHERE uuid = ?
                                                   LIMIT 1`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Inventories#create[1]: Database request failed`, err)
                return [];
            });

        return (result as Inventory[])[0] ?? undefined;
    }

    /**
     * todo
     * @param amount
     * @param order_by
     * @param order
     * @param offset
     */
    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<Inventory[]> {
        const [inventories] = await connection.query(`SELECT uuid,
                                                             owner,
                                                             name,
                                                             description,
                                                             last_update,
                                                             created_at
                                                      FROM inventories
                                                      ORDER BY ${order_by === '' ? 'created_at' : order_by} ${order}
                                                      LIMIT ${amount} OFFSET ${offset}`)
            .catch((err: Error): [] => {
                Log.error(`Inventories#fetch[0]: Database request failed`, err)
                return [];
            });

        const list: Inventory[] = inventories as Inventory[];

        if (list.length !== 0) {
            const [itemAmounts] = await connection.query(`SELECT COUNT(amount) as item_amount, inventory
                                                          FROM items
                                                          GROUP BY inventory`)
                .catch((err: Error): [] => {
                    Log.error(`Inventories#fetch[1]: Database request failed`, err)
                    return [];
                });

            for (const inventory of list) {
                for (const result of itemAmounts as RowDataPacket[]) {
                    if (inventory.uuid === result.inventory) {
                        inventory.item_amount = result.item_amount;
                        continue;
                    }
                    inventory.item_amount = 0;
                }
            }
        }

        return list;
    }

    /**
     * todo
     */
    static async fetchTotalInventoryCount(): Promise<number> {
        const [result] = await connection.query(`SELECT COUNT(uuid) AS amount
                                                 FROM inventories`)
            .catch((err: Error): [] => {
                Log.error(`Inventories#fetchTotalInventoryCount[0]: Database request failed`, err)
                return [];
            });

        return (result as RowDataPacket[])[0].amount ?? 0;
    }

    /**
     * todo
     * @param uuid
     */
    static async fetchInventoryByUuid(uuid: string): Promise<Inventory | undefined> {
        if (!validate(uuid)) {
            Log.error(`Inventories#fetchInventoryByUuid: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return undefined;
        }

        const [result] = await connection.execute(`SELECT *
                                                   FROM inventories
                                                   WHERE uuid = ?
                                                   LIMIT 1`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Inventories#fetchInventoryByUuid[0]: Database request failed`, err)
                return [];
            });

        return (result as Inventory[])[0] ?? undefined;
    }
}

export class Items {
    /**
     * todo
     * @param created_by
     * @param inventory
     * @param name
     * @param description
     * @param amount
     * @param image
     * @param url
     * @param price
     * @param currency
     */
    static async create(created_by: string, inventory: string, name: string, description?: string, amount: number = 0, image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<Item | undefined> {
        const uuid: string = uuidv7();

        await connection.execute(`INSERT INTO items (uuid, created_by, inventory, name, description, amount, image, url, price, currency)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [uuid, created_by, inventory, name, description ?? null, amount, image ?? null, url ?? null, price, currency])
            .catch((err: Error): void => Log.error(`Items#create[0]: Database request failed. ${err.name}`, err));

        const [result] = await connection.execute(`SELECT *
                                                   FROM items
                                                   WHERE uuid = ?
                                                   LIMIT 1`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Items#create[1]: Database request failed`, err)
                return [];
            });

        return (result as Item[])[0] ?? undefined;
    }

    /**
     * todo
     * @param inventory
     * @param amount
     * @param order_by
     * @param order
     * @param offset
     */
    static async fetch(inventory: string, amount: number = 15, order: string, offset: number = 0, order_by?: string): Promise<Item[]> {
        const [result] = await connection.execute(`SELECT items.uuid        as uuid,
                                                          items.inventory   as inventory,
                                                          items.name        as name,
                                                          items.description as description,
                                                          items.amount      as amount,
                                                          items.image       as image,
                                                          items.url         as url,
                                                          items.price       as price,
                                                          items.last_update as last_update,
                                                          items.currency    as currency,
                                                          currencies.format as currency_format
                                                   FROM items
                                                            LEFT JOIN currencies ON items.currency = currencies.code
                                                   WHERE items.inventory = ?
                                                   ORDER BY ${order_by ? order_by : 'created_at'} ${order}
                                                   LIMIT ${amount} OFFSET ${offset}`, [inventory])
            .catch((err: Error): [] => {
                Log.error(`Items#fetch[0]: Database request failed`, err)
                return [];
            });

        return result as Item[];
    }

    /**
     * todo
     * @param inventory
     */
    static async fetchTotalItemCount(inventory: string): Promise<number> {
        const [result] = await connection.execute(`SELECT COUNT(uuid) AS amount
                                                   FROM items
                                                   WHERE inventory = ?`, [inventory])
            .catch((err: Error): [] => {
                Log.error(`Items#fetchTotalItemCount[0]: Database request failed`, err)
                return [];
            });

        return (result as RowDataPacket[])[0].amount ?? 0;
    }

    /**
     * todo
     * @param uuid
     */
    static async deleteItem(uuid: string): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Items#deleteItem: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return undefined;
        }

        await connection.execute(`DELETE
                                  FROM items
                                  WHERE uuid = ?`, [uuid])
            .catch((err: Error): void => Log.error(`Items#deleteItem[0]: Database request failed`, err));
    }
}

/**
 * todo
 */
export class Users {
    /**
     * Creates a new user in the database, and returns the new user's uuid.
     * @param email The user's email.
     * @param username The user's username.
     * @param password_hash A hashed version of the user's password.
     * @param superuser If the user should have administrator rights.
     */
    static async create(email: string, username: string, password_hash: string, superuser: boolean = false): Promise<User | undefined> {
        const uuid: string = uuidv7();

        await connection.execute(`INSERT INTO users (uuid, email, username, password_hash, superuser)
                                  VALUES (?, ?, ?, ?, ?)`, [uuid, email, username, password_hash, superuser])
            .catch((err: Error): void => Log.error(`Users#create[0]: Database request failed. ${err.name}`, err));

        const [result] = await connection.execute(`SELECT *
                                                   FROM users
                                                   WHERE uuid = ?
                                                   LIMIT 1`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#create[1]: Database request failed`, err)
                return [];
            });

        return (result as User[])[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getFromUuid(uuid: string): Promise<User | undefined> {
        if (!validate(uuid)) {
            Log.error(`Users#getFromUuid: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return undefined;
        }

        const [result] = await connection.execute(`SELECT *
                                                   FROM users
                                                   WHERE uuid = ?`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#getFromUuid[0]: Database request failed`, err)
                return [];
            });

        return (result as User[])[0] ?? undefined;
    }

    /**
     * todo
     * @param email
     */
    static async getFromEmail(email: string): Promise<User | undefined> {
        const [result] = await connection.execute(`SELECT *
                                                   FROM users
                                                   WHERE email = ?`, [email])
            .catch((err: Error): [] => {
                Log.error(`Users#getFromEmail[0]: Database request failed`, err)
                return [];
            });

        return (result as User[])[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getPasswordHash(uuid: string): Promise<string> {
        if (!validate(uuid)) {
            Log.error(`Users#getPasswordHash: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return '';
        }

        const [result] = await connection.execute(`SELECT password_hash
                                                   FROM users
                                                   WHERE uuid = ?`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#getPasswordHash[0]: Database request failed`, err)
                return [];
            });

        return (result as RowDataPacket[])[0].password_hash ?? '';
    }

    /**
     * todo
     * @param uuid
     * @param passwordHash
     */
    static async setPasswordHash(uuid: string, passwordHash: string): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Users#setPasswordHash: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return;
        }

        await connection.execute(`UPDATE users
                                  SET password_hash = ?
                                  WHERE uuid = ?`, [passwordHash, uuid])
            .catch((err: Error): void => Log.error(`Users#setPasswordHash[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async updateLastLogin(uuid: string): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Users#updateLastLogin: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return;
        }

        await connection.execute(`UPDATE users
                                  SET last_login = CURRENT_TIMESTAMP
                                  WHERE uuid = ?`, [uuid])
            .catch((err: Error): void => Log.error(`Users#updateLastLogin[0]: Database request failed`, err));
    }

    /**
     * todo
     */
    static async getUserAmount(): Promise<number> {
        const [result] = await connection.query(`SELECT count(uuid) as amount
                                                 FROM users`)
            .catch((err: Error): [] => {
                Log.error(`Users#getUserAmount[0]: Database request failed`, err)
                return [];
            });

        return (result as RowDataPacket[])[0].amount ?? -1;
    }

    /**
     * todo
     * @param uuid
     * @param inventory
     */
    static async updatePrimaryInventory(uuid: string, inventory: string | null): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Users#setPrimaryInventory: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return;
        }

        await connection.execute(`UPDATE users
                                  SET primary_inventory = ?
                                  WHERE uuid = ?`, [inventory, uuid])
            .catch((err: Error): void => Log.error(`Users#setPrimaryInventory[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param uuid
     * @param theme
     */
    static async updatePreferredTheme(uuid: string, theme: PageTheme): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Users#updatePreferredTheme: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return;
        }

        await connection.execute(`UPDATE users
                                  SET preferred_theme = ?
                                  WHERE uuid = ?`, [theme, uuid])
            .catch((err: Error): void => Log.error(`Users#updatePreferredTheme[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async getSettings(uuid: string): Promise<UserSettings> {
        const settings: UserSettings = new UserSettings(uuid);

        const [categories] = await connection.execute(`SELECT DISTINCTROW category, category_order
                                                       FROM user_settings
                                                       WHERE uuid = ?
                                                       ORDER BY category_order`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#getSettings[0]: Database request failed`, err);
                return [];
            });

        const [all_categories] = await connection.execute(`SELECT DISTINCTROW category, category_order, subcategory, subcategory_order
                                                           FROM user_settings
                                                           WHERE uuid = ?
                                                           ORDER BY category_order, subcategory_order`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#getSettings[1]: Database request failed`, err);
                return [];
            });

        const [setting] = await connection.execute(`SELECT *
                                                    FROM user_settings
                                                    WHERE uuid = ?
                                                    ORDER BY category_order, subcategory_order, setting_order`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#getSettings[2]: Database request failed`, err);
                return [];
            });

        settings.load(categories as RowDataPacket[], all_categories as RowDataPacket[], setting as Setting[]);

        return settings;
    }

    /**
     * todo
     */
    static async isSuperuser(uuid: string): Promise<boolean> {
        const [result] = await connection.query(`SELECT superuser
                                                 FROM users
                                                 WHERE uuid = ?`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Users#isSuperuser[0]: Database request failed`, err)
                return [];
            });

        return (result as RowDataPacket[])[0].superuser ?? 0;
    }
}

/**
 * todo
 */
export class Auth {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async newSession(session: Session): Promise<void> {
        await connection.execute(`INSERT INTO sessions (uuid, session_id)
                                  VALUES (?, ?)
                                  ON DUPLICATE KEY UPDATE session_id = ?,
                                                          expires=(ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))`,
            [session.uuid, session.session_id, session.session_id])
            .catch((err: Error): void => Log.error(`Auth#newSession[0]: Database request failed`, err));

        session.expires = await this.getSessionExpiration(session.session_id);
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session | undefined> {
        const [result] = await connection.execute(`SELECT *
                                                   FROM sessions
                                                   WHERE session_id = ?`, [session_id])
            .catch((err: Error): [] => {
                Log.error(`Auth#getSession[0]: Database request failed`, err)
                return [];
            });

        return (result as Session[])[0] ?? undefined;
    }

    /**
     * Gets all existing session.
     * @param uuid UUID of the user.
     */
    static async getSessions(uuid: string): Promise<Session[]> {
        const [results] = await connection.execute(`SELECT *
                                                    FROM sessions
                                                    WHERE uuid = ?
                                                    ORDER BY last_accessed`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Auth#getSession[0]: Database request failed`, err)
                return [];
            });

        if (!(results as RowDataPacket[])[0].uuid) return [];

        const result = results as RowDataPacket[];
        for (let session of result) {
            session.expires = Date.parse(session.expires);
            session.last_accessed = Date.parse(session.last_accessed);
            session.created_at = Date.parse(session.created_at);
        }

        return result as Session[];
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session The session to renew.
     */
    static async renewSession(session: Session): Promise<void> {
        await connection.execute(`UPDATE sessions
                                  SET expires = (ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))
                                  WHERE session_id = ?`, [session.session_id])
            .catch((err: Error): void => Log.error(`Auth#renewSession[0]: Database request failed`, err));

        session.expires = await this.getSessionExpiration(session.session_id);
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        await connection.execute(`DELETE
                                  FROM sessions
                                  WHERE session_id = ?`, [session_id])
            .catch((err: Error): void => Log.error(`Auth#invalidateSession[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async getSessionExpiration(session_id: string): Promise<number> {
        const [results] = await connection.execute(`SELECT expires
                                                    FROM sessions
                                                    WHERE session_id = ?`, [session_id])
            .catch((err: Error): [] => {
                Log.error(`Auth#getSessionExpiration[0]: Database request failed`, err);
                return [];
            });

        const result = results as RowDataPacket[];

        return result[0] && result[0].expires ? Date.parse(String(result[0].expires)) : -1;
    }

    /**
     * todo
     * @param session_id
     */
    static async updateLastAccess(session_id: string): Promise<void> {
        await connection.execute(`UPDATE sessions
                                  SET last_accessed = CURRENT_TIMESTAMP
                                  WHERE session_id = ?`, [session_id])
            .catch((err: Error): void => Log.error(`Auth#updateLastAccess[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param session_id
     * @param data
     */
    static async updateSessionInformation(session_id: string, data: {
        continent?: string,
        country?: string,
        regionName?: string,
        city?: string,
        query?: string,
        device?: string,
        platform?: string
    }): Promise<void> {
        await connection.execute(`UPDATE sessions
                                  SET ip        = ?,
                                      continent = ?,
                                      country   = ?,
                                      region    = ?,
                                      city      = ?,
                                      device    = ?,
                                      platform  = ?
                                  WHERE session_id = ?`, [data.query ?? null, data.continent ?? null, data.country ?? null, data.regionName ?? null, data.city ?? null, data.device ?? null, data.platform ?? null, session_id])
            .catch((err: Error): void => Log.error(`Auth#updateSessionInformation[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async isSessionInformationMissing(session_id: string): Promise<boolean> {
        const [result] = await connection.execute(`SELECT ip, continent, country, region, city, device, platform
                                                   FROM sessions
                                                   WHERE session_id = ?`, [session_id])
            .catch((err: Error): [] => {
                Log.error(`Auth#updateSessionInformation[0]: Database request failed`, err)
                return [];
            });

        const info = result as RowDataPacket[][0];
        return !info.ip || !info.continent || !info.country || !info.region || !info.city || !info.device || !info.platform;
    }

    /**
     * todo
     * @param token
     */
    static async getResetRequest(token: string): Promise<ResetRequest | undefined> {
        const [result] = await connection.execute(`SELECT *
                                                   FROM reset_tokens
                                                   WHERE token = ?`, [token])
            .catch((err: Error): [] => {
                Log.error(`Auth#getResetRequest[0]: Database request failed`, err)
                return [];
            });

        return (result as ResetRequest[])[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getResetRequestFromUuid(uuid: string): Promise<ResetRequest | undefined> {
        if (!validate(uuid)) {
            Log.error(`Auth#getResetRequestFromUuid: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return undefined;
        }

        const [result] = await connection.execute(`SELECT *
                                                   FROM reset_tokens
                                                   WHERE uuid = ?`, [uuid])
            .catch((err: Error): [] => {
                Log.error(`Auth#getResetRequestFromUuid[0]: Database request failed`, err)
                return [];
            });

        return (result as ResetRequest[])[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     * @param token
     */
    static async setResetToken(uuid: string, token: string): Promise<void> {
        if (!validate(uuid)) {
            Log.error(`Auth#setResetToken: '${uuid}' is not a valid UUID! Ignoring database request...`);
            return undefined;
        }

        await connection.execute(`INSERT INTO reset_tokens(uuid, token)
                                  VALUES (?, ?)
                                  ON DUPLICATE KEY UPDATE token   = ?,
                                                          expires = (ADDTIME(CURRENT_TIMESTAMP, "30:0"))`, [uuid, token, token])
            .catch((err: Error): void => Log.error(`Auth#setResetToken[0]: Database request failed`, err));
    }

    /**
     * todo
     * @param token
     */
    static async deleteResetToken(token: string): Promise<void> {
        await connection.execute(`DELETE
                                  FROM reset_tokens
                                  WHERE token = ?`, [token])
            .catch((err: Error): void => Log.error(`Auth#deleteResetToken[0]: Database request failed`, err));
    }
}

export default {Inventories, Items, Users, Auth};