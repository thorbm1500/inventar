import {LOGGER, SQL} from "../../../hooks.server";
import type {Currency, Inventory, Item, Label, PageTheme, ResetRequest, Session, Unit, User} from "$lib/server/db/interfaces";
import currencies from "$lib/server/db/components/currencies";
import {UserSettings} from "$lib/components/settings/UserSettings";
import type {Setting} from "$lib/components/settings/GenericSettings.svelte";
import {units} from "$lib/server/db/components/units";

export class Database {
    // noinspection JSUnusedGlobalSymbols
    private static readonly SQL: Bun.SQL = new Bun.SQL({
        adapter: 'mysql',
        max: 10,
        idleTimeout: 0,
        maxLifetime: 0,
        connectionTimeout: 60,
        bigint: true,
        onconnect: (err): void => {
            if (err) {
                LOGGER.error(`Failed to connect to database. `, err);
            } else {
                LOGGER.debug('New database connection established.');
            }
        }
    });

    constructor() {
        this.init();
    }


    /**
     * This method initializes the database, ensuring all tables,
     * and their default values are present, as well as all constraints for each table.
     * This method is called one, during the server load, at startup.
     */
    private async init(): Promise<void> {
        await LOGGER.timed('Initializing database...', 'Database initialization completed.', async () => {
            await ensureTables();
            await ensureConstraints();
            await ensureDefaultValues();
        });
    }
}

/**
 * Returns the {@link SQL} connection variable. This method is only
 * for convenience, and should not be used for permanent actions.
 */
export function getConnection(): Bun.SQL {
    return SQL;
}

/**
 * Ensures all tables are present in the database.
 */
async function ensureTables(): Promise<void> {
    LOGGER.debug(`Creating tables...`);
    await SQL`CREATE TABLE IF NOT EXISTS currencies
              (
                  id     CHAR(3)     NOT NULL,
                  code   CHAR(3)     NOT NULL,
                  format VARCHAR(18) NOT NULL,
                  PRIMARY KEY (id),
                  CONSTRAINT currencies_code_u
                      UNIQUE (code),
                  CONSTRAINT currencies_id_u
                      UNIQUE (id)
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'currencies'. `, err));

    await SQL`CREATE TABLE IF NOT EXISTS units
              (
                  unit VARCHAR(24) NOT NULL,
                  type VARCHAR(12) NOT NULL,
                  PRIMARY KEY (unit)
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'units'. `, err));

    /*
   todo: If account of owner is attempted deleted;
    Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
    */
    await SQL`CREATE TABLE IF NOT EXISTS inventories
              (
                  uuid        CHAR(36)                            NOT NULL,
                  owner       CHAR(36)                            NOT NULL,
                  name        VARCHAR(64)                         NOT NULL,
                  description TEXT                                NULL,
                  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                  PRIMARY KEY (uuid),
                  CONSTRAINT inventories_uuid_u
                      UNIQUE (uuid)
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'inventories'. `, err));

    await SQL`CREATE TABLE IF NOT EXISTS users
              (
                  uuid              CHAR(36)                             NOT NULL,
                  email             VARCHAR(254)                         NOT NULL,
                  password_hash     VARCHAR(255)                         NOT NULL,
                  username          VARCHAR(32)                          NOT NULL,
                  profile_picture   TEXT                                 NULL,
                  primary_inventory CHAR(36)                             NULL,
                  preferred_theme   VARCHAR(5) DEFAULT 'dark'            NOT NULL,
                  created_at        TIMESTAMP  DEFAULT CURRENT_TIMESTAMP NOT NULL,
                  superuser         TINYINT(1) DEFAULT 0                 NOT NULL,
                  PRIMARY KEY (uuid),
                  CONSTRAINT users_uuid_u
                      UNIQUE (uuid),
                  CONSTRAINT users_email_u
                      UNIQUE (email),
                  CONSTRAINT users_username_u
                      UNIQUE (username),
                  CONSTRAINT users_profile_picture_u
                      UNIQUE (profile_picture),
                  CONSTRAINT users_primary_inventory_fk
                      FOREIGN KEY (primary_inventory) REFERENCES inventories (uuid)
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'users'. `, err));

    await SQL`CREATE TABLE IF NOT EXISTS items
              (
                  inventory           CHAR(36)                                 NOT NULL,
                  uuid                CHAR(36)                                 NOT NULL,
                  name                VARCHAR(120)                             NOT NULL,
                  description         TEXT                                     NULL,
                  amount              INT(255)       DEFAULT 0                 NOT NULL,
                  reserved_amount     INT(255)       DEFAULT 0                 NOT NULL,
                  reserved_expiration TIMESTAMP                                NULL,
                  pending_amount      INT(255)       DEFAULT 0                 NOT NULL,
                  pending_expiration  TIMESTAMP                                NULL,
                  part_number         VARCHAR(64)                              NULL,
                  unit_type           VARCHAR(42)                              NOT NULL,
                  unit                VARCHAR(42)                              NOT NULL,
                  image               TEXT                                     NULL,
                  url                 TEXT                                     NULL,
                  price               DECIMAL(50, 2) DEFAULT 0.00              NOT NULL,
                  currency            CHAR(3)        DEFAULT 'N/A'             NOT NULL,
                  created_by          CHAR(36)                                 NOT NULL,
                  last_update         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                  created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
                  PRIMARY KEY (inventory, uuid),
                  CONSTRAINT items_uuid_u
                      UNIQUE (uuid),
                  CONSTRAINT items_inventory_fk
                      FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                          ON DELETE CASCADE,
                  CONSTRAINT items_unit_fk
                      FOREIGN KEY (unit) REFERENCES units (unit),
                  CONSTRAINT items_currency_fk
                      FOREIGN KEY (currency) REFERENCES currencies (code),
                  CONSTRAINT items_created_by_fk
                      FOREIGN KEY (created_by) REFERENCES users (uuid)
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'items'. `, err));

    await SQL`CREATE TABLE IF NOT EXISTS labels
              (
                  inventory CHAR(36)    NOT NULL,
                  name      VARCHAR(24) NOT NULL,
                  color     VARCHAR(24) NOT NULL,
                  PRIMARY KEY (inventory, name),
                  CONSTRAINT labels_inventory_fk
                      FOREIGN KEY (inventory) REFERENCES inventories (uuid)
              )`

    await SQL`CREATE TABLE IF NOT EXISTS sessions
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
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'sessions'. `, err));

    await SQL`CREATE TABLE IF NOT EXISTS reset_tokens
              (
                  uuid    CHAR(36)                                               NOT NULL,
                  token   VARCHAR(255)                                           NOT NULL,
                  expires TIMESTAMP DEFAULT (ADDTIME(CURRENT_TIMESTAMP, "15:0")) NOT NULL,
                  PRIMARY KEY (uuid),
                  CONSTRAINT reset_tokens_uuid_fk
                      FOREIGN KEY (uuid) REFERENCES users (uuid)
                          ON DELETE CASCADE
              )`
        .catch((err: any): void => LOGGER.error(`Failed to create table 'reset_tokens'. `, err));
}

/**
 * Ensures all table constraint are in place. Some constraints are unable to be created when creating the tables,
 * due to cross-references between the tables. If possible, a constraint is defined when the table is created,
 * otherwise the constraint will be created when this method is called.
 */
async function ensureConstraints(): Promise<void> {
    LOGGER.debug(`Creating table constraints...`);

    const constraint = await SQL`SELECT CONSTRAINT_NAME as name,
                                        CONSTRAINT_TYPE as type
                                 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                                 WHERE TABLE_SCHEMA = 'inventar'
                                   AND TABLE_NAME = 'inventories'
                                   AND CONSTRAINT_NAME = 'inventories_owner_fk'`
        .catch((err: any): [] => {
            LOGGER.error(`Failed to select existing constraints from table 'inventories'. `, err);
            return [];
        });

    if (constraint.length === 0 || constraint[0]?.name !== 'inventories_owner_fk') {
        await SQL`ALTER TABLE inventories
            ADD CONSTRAINT inventories_owner_fk
                FOREIGN KEY (owner) REFERENCES users (uuid)`
            .catch((err: any): void => LOGGER.error(`Failed to add constraint 'fk_owner' to table 'inventories'. `, err));
    }
}

/**
 * Ensures all default values are present in the database.
 */
async function ensureDefaultValues(): Promise<void> {
    LOGGER.debug(`Ensuring default values...`);

    /**
     * Adds all the currencies to the currency table.
     * ID should theoretically never change, hence why it's the primary key.
     * If any of the currencies' values changes, they'll be updated as well,
     * to allow for adding more formats at any time.
     */
    for (const row of currencies) {
        await SQL`INSERT INTO currencies (id, code, format)
                  VALUES (${row.id}, ${row.code}, ${row.format ?? '%value%'})
                  ON DUPLICATE KEY UPDATE code=${row.code},
                                          format=${row.format ?? '%value%'}`
            .catch((err: any): void => LOGGER.error(`Failed to add default values to table 'currencies'. `, err))
    }

    /**
     * Adds all the units for the units table.
     * Unlike currencies, this table doesn't have any value we can rely on,
     * to not change, so any changes in the future will have to be done
     * manually.
     */
    for (const row of units) {
        await SQL`INSERT IGNORE INTO units (unit, type)
                  VALUES (${row.unit}, ${row.type})`
            .catch((err: any): void => LOGGER.error(`Failed to add default values to table 'units'. `, err))
    }
}

/**
 * This method returns all the currencies from the database.
 * @return List of currencies as {@link Currency} object.
 */
export async function getCurrencies(): Promise<Currency[]> {
    return await SQL`SELECT *
                     FROM currencies
                     ORDER BY code ASC`
        .catch((err: any): Currency[] => {
            LOGGER.error(`getCurrencies[0]: Database request failed. `, err)
            return [];
        }) as Currency[];
}

export async function getUnits(): Promise<Unit[]> {
    return await SQL`SELECT *
                     FROM units
                     ORDER BY type`
        .catch((err: any): Unit[] => {
            LOGGER.error(`getUnits[0]: Database request failed. `, err)
            return [];
        }) as Unit[];
}

/**
 * A Helper class for dealing with Inventories in the database.
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
        const uuid: string = Bun.randomUUIDv7();

        await SQL`INSERT INTO inventories(uuid, owner, name, description)
                  VALUES (${uuid}, ${owner}, ${name}, ${description ?? null})`
            .catch((err: any): void => LOGGER.error(`Inventories#create[0]: Database request failed. `, err));

        const result: Inventory[] = await SQL`SELECT *
                                              FROM inventories
                                              WHERE uuid = ${uuid}
                                              LIMIT 1`
            .catch((err: any): [] => {
                LOGGER.error(`Inventories#create[1]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param amount
     * @param order_by
     * @param order
     * @param offset
     */
    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<Inventory[]> {
        const inventories: Inventory[] = await SQL`SELECT uuid,
                                                          owner,
                                                          name,
                                                          description,
                                                          last_update,
                                                          created_at
                                                   FROM inventories
                                                   ORDER BY ${SQL(order_by === '' ? 'created_at' : order_by) + ' ' + order}
                                                   LIMIT ${amount} OFFSET ${offset}`
            .catch((err: any): [] => {
                LOGGER.error(`Inventories#fetch[0]: Database request failed. `, err)
                return [];
            });

        if (inventories.length !== 0) {
            const itemAmounts = await SQL`SELECT COUNT(amount) as item_amount, inventory
                                          FROM items
                                          GROUP BY inventory`
                .catch((err: any): [] => {
                    LOGGER.error(`Inventories#fetch[1]: Database request failed. `, err)
                    return [];
                });

            for (const inventory of inventories) {
                for (const result of itemAmounts) {
                    if (inventory.uuid === result.inventory) {
                        inventory.item_amount = result.item_amount;
                        continue;
                    }
                    inventory.item_amount = 0;
                }
            }
        }

        return inventories;
    }

    /**
     * todo
     */
    static async fetchTotalInventoryCount(): Promise<number> {
        const inventoryCount = await SQL`SELECT COUNT(uuid) AS amount
                                         FROM inventories`
            .catch((err: any): [] => {
                LOGGER.error(`Inventories#fetchTotalInventoryCount[0]: Database request failed. `, err)
                return [];
            });

        return inventoryCount[0].amount ?? 0;
    }

    /**
     * todo
     * @param uuid
     */
    static async fetchInventoryByUuid(uuid: string): Promise<Inventory | undefined> {
        const result: Inventory[] = await SQL`SELECT *
                                              FROM inventories
                                              WHERE uuid = ${uuid}
                                              LIMIT 1`
            .catch((err: any): Inventory[] => {
                LOGGER.error(`Inventories#fetchInventoryByUuid[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    static async fetchLabels(uuid: string): Promise<Label[]> {
        const result: Label[] = await SQL`SELECT *
                                          FROM labels
                                          WHERE inventory = ${uuid}
                                          ORDER BY name DESC`
            .catch((err: any): Label[] => {
                LOGGER.error(`Inventories#fetchLabels[0]: Database request failed. `, err)
                return [];
            });

        return result ?? undefined;
    }
}

/**
 * A Helper class for dealing with Items in the database.
 */
export class Items {
    /**
     * todo
     * @param created_by
     * @param inventory
     * @param name
     * @param amount
     * @param options
     */
    static async create(created_by: string, inventory: string, name: string, amount: number = 0, options?: {
        description?: string,
        image?: string,
        unit_type?: string,
        unit?: string,
        url?: string,
        price?: number,
        currency?: string
    }): Promise<Item | undefined> {
        const uuid: string = Bun.randomUUIDv7();

        await SQL`INSERT INTO items (uuid, created_by, inventory, name, amount, unit_type, unit, description, image, url, price, currency)
                  VALUES (${uuid}, ${created_by}, ${inventory}, ${name}, ${amount}, ${options?.unit_type ?? 'count'}, ${options?.unit ?? 'piece'}, ${options?.description ?? null},
                          ${options?.image ?? null}, ${options?.url ?? null}, ${options?.price ?? 0.00},
                          ${options?.currency ?? 'EUR'})`
            .catch((err: any): void => LOGGER.error(`Items#create[0]: Database request failed. ${err.name}`, err));

        const result: Item[] = await SQL`SELECT *
                                         FROM items
                                         WHERE uuid = ${uuid}
                                         LIMIT 1`
            .catch((err: any): Item[] => {
                LOGGER.error(`Items#create[1]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param inventory
     * @param amount
     * @param order_by
     * @param order
     * @param offset
     */
    static async fetch(inventory: string, amount: number = 15, offset: number = 0, order_by?: string): Promise<Item[]> {
        const result: Item[] = await SQL`SELECT items.uuid        as uuid,
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
                                         WHERE items.inventory = ${inventory}
                                         ORDER BY ${SQL(order_by ?? 'last_update')}
                                         LIMIT ${amount} OFFSET ${offset}`
            .catch((err: any): Item[] => {
                LOGGER.error(`Items#fetch[0]: Database request failed. `, err)
                return [];
            });

        return result;
    }

    /**
     * todo
     * @param inventory
     */
    static async fetchTotalItemCount(inventory: string): Promise<number> {
        const result: Item[] = await SQL`SELECT COUNT(uuid) AS amount
                                         FROM items
                                         WHERE inventory = ${inventory}`
            .catch((err: any): Item[] => {
                LOGGER.error(`Items#fetchTotalItemCount[0]: Database request failed. `, err)
                return [];
            });

        return result[0].amount ?? 0;
    }

    static async getItem(uuid: string): Promise<Item | undefined> {
        const result: Item[] = await SQL`SELECT *
                                         FROM items
                                         WHERE uuid = ${uuid}`
            .catch((err: any): Item[] => {
                LOGGER.error(`Items#fetchTotalItemCount[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async deleteItem(uuid: string): Promise<void> {
        await SQL`DELETE
                  FROM items
                  WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Items#deleteItem[0]: Database request failed. `, err));
    }
}

/**
 * A Helper class for dealing with Users in the database.
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
        const uuid: string = Bun.randomUUIDv7();

        await SQL`INSERT INTO users (uuid, email, username, password_hash, superuser)
                  VALUES (${uuid}, ${email}, ${username}, ${password_hash}, ${superuser})`
            .catch((err: any): void => LOGGER.error(`Users#create[0]: Database request failed. `, err));

        const result: User[] = await SQL`SELECT *
                                         FROM users
                                         WHERE uuid = ${uuid}
                                         LIMIT 1`
            .catch((err: any): User[] => {
                LOGGER.error(`Users#create[1]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getFromUuid(uuid: string): Promise<User | undefined> {
        const result: User[] = await SQL`SELECT *
                                         FROM users
                                         WHERE uuid = ${uuid}`
            .catch((err: any): User[] => {
                LOGGER.error(`Users#getFromUuid[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param email
     */
    static async getFromEmail(email: string): Promise<User | undefined> {
        const result: User[] = await SQL`SELECT *
                                         FROM users
                                         WHERE email = ${email}`
            .catch((err: any): User[] => {
                LOGGER.error(`Users#getFromEmail[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    static async getUuidFromUsername(username: string): Promise<string | null> {
        const [result] = await SQL`SELECT uuid
                                   FROM users
                                   WHERE username = ${username}`
            .catch((err: any): User[] => {
                LOGGER.error(`Users#getUuidFromUsername[0]: Database request failed. `, err)
                return [];
            });

        return result[0].uuid ?? null;
    }

    /**
     * todo
     * @param uuid
     */
    static async getPasswordHash(uuid: string): Promise<string> {
        const result = await SQL`SELECT password_hash
                                 FROM users
                                 WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getPasswordHash[0]: Database request failed. `, err)
                return [];
            });

        return result[0].password_hash ?? '';
    }

    /**
     * todo
     * @param uuid
     * @param passwordHash
     */
    static async setPasswordHash(uuid: string, passwordHash: string): Promise<void> {
        await SQL`UPDATE users
                  SET password_hash = ${passwordHash}
                  WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Users#setPasswordHash[0]: Database request failed. `, err));
    }

    /**
     * todo
     */
    static async getUserAmount(): Promise<number> {
        const result = await SQL`SELECT count(uuid) as amount
                                 FROM users`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getUserAmount[0]: Database request failed. `, err)
                return [];
            });

        return result[0].amount ?? -1;
    }

    /**
     * todo
     * @param uuid
     * @param inventory
     */
    static async updatePrimaryInventory(uuid: string, inventory: string | null): Promise<void> {
        await SQL`UPDATE users
                  SET primary_inventory = ${inventory}
                  WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Users#setPrimaryInventory[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     * @param theme
     */
    static async updatePreferredTheme(uuid: string, theme: PageTheme): Promise<void> {
        await SQL`UPDATE users
                  SET preferred_theme = ${theme}
                  WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Users#updatePreferredTheme[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async getSettings(uuid: string): Promise<UserSettings> {
        const settings: UserSettings = new UserSettings(uuid);

        const categories: { category: string, category_order: string | number }[] = await SQL`SELECT DISTINCTROW category, category_order
                                                                                              FROM user_settings
                                                                                              WHERE uuid = ${uuid}
                                                                                              ORDER BY category_order`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getSettings[0]: Database request failed. `, err);
                return [];
            });

        const all_categories: {
            category: string,
            category_order: string | number,
            subcategory: string,
            subcategory_order: string | number
        }[] = await SQL`SELECT DISTINCTROW category, category_order, subcategory, subcategory_order
                        FROM user_settings
                        WHERE uuid = ${uuid}
                        ORDER BY category_order, subcategory_order`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getSettings[1]: Database request failed. `, err);
                return [];
            });

        const setting: Setting[] = await SQL`SELECT *
                                             FROM user_settings
                                             WHERE uuid = ${uuid}
                                             ORDER BY category_order, subcategory_order, setting_order`
            .catch((err: any): Setting[] => {
                LOGGER.error(`Users#getSettings[2]: Database request failed. `, err);
                return [];
            });

        settings.load(categories, all_categories, setting);

        return settings;
    }

    /**
     * todo
     */
    static async isSuperuser(uuid: string): Promise<boolean> {
        const result = await SQL`SELECT superuser
                                 FROM users
                                 WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Users#isSuperuser[0]: Database request failed. `, err)
                return [];
            });

        return result[0].superuser ?? 0;
    }
}

/**
 * A Helper class for dealing with Auth in the database.
 */
export class Auth {
    /**
     * Creates a new session in the database.
     * @param uuid todo
     * @param session_id todo
     */
    static async newSession(uuid: string, session_id: string): Promise<void> {
        await SQL`INSERT INTO sessions (uuid, session_id)
                  VALUES (${uuid}, ${session_id})
                  ON DUPLICATE KEY UPDATE session_id = ${session_id},
                                          expires=(ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))`
            .catch((err: any): void => LOGGER.error(`Auth#newSession[0]: Database request failed. `, err));
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session | undefined> {
        const result: Session[] = await SQL`SELECT *
                                            FROM sessions
                                            WHERE session_id = ${session_id}`
            .catch((err: any): Session[] => {
                LOGGER.error(`Auth#getSession[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * Gets all existing session.
     * @param uuid UUID of the user.
     */
    static async getSessions(uuid: string): Promise<Session[]> {
        const results = await SQL`SELECT *
                                  FROM sessions
                                  WHERE uuid = ${uuid}
                                  ORDER BY last_accessed`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#getSession[0]: Database request failed. `, err)
                return [];
            });

        if (!results[0].uuid) return [];

        for (let session of results) {
            session.expires = Date.parse(String(session.expires));
            session.last_accessed = Date.parse(String(session.last_accessed));
            session.created_at = Date.parse(String(session.created_at));
        }

        return results;
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id ID of the session to renew.
     */
    static async renewSession(session_id: string): Promise<void> {
        await SQL`UPDATE sessions
                  SET expires = (ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))
                  WHERE session_id = ${session_id}`
            .catch((err: any): void => LOGGER.error(`Auth#renewSession[0]: Database request failed. `, err));
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        await SQL`DELETE
                  FROM sessions
                  WHERE session_id = ${session_id}`
            .catch((err: any): void => LOGGER.error(`Auth#invalidateSession[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async getSessionExpiration(session_id: string): Promise<number> {
        const results = await SQL`SELECT expires
                                  FROM sessions
                                  WHERE session_id = ${session_id}`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#getSessionExpiration[0]: Database request failed. `, err);
                return [];
            });

        return results[0] && results[0].expires ? Date.parse(String(results[0].expires)) : -1;
    }

    /**
     * todo
     * @param session_id
     */
    static async updateLastAccess(session_id: string): Promise<void> {
        await SQL`UPDATE sessions
                  SET last_accessed = CURRENT_TIMESTAMP
                  WHERE session_id = ${session_id}`
            .catch((err: any): void => LOGGER.error(`Auth#updateLastAccess[0]: Database request failed. `, err));
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
        await SQL`UPDATE sessions
                  SET ip        = ${data.query ?? null},
                      continent = ${data.continent ?? null},
                      country   = ${data.country ?? null},
                      region    = ${data.regionName ?? null},
                      city      = ${data.city ?? null},
                      device    = ${data.device ?? null},
                      platform  = ${data.platform ?? null}
                  WHERE session_id = ${session_id}`
            .catch((err: any): void => LOGGER.error(`Auth#updateSessionInformation[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async isSessionInformationMissing(session_id: string): Promise<boolean> {
        const [result] = await SQL`SELECT ip, continent, country, region, city, device, platform
                                   FROM sessions
                                   WHERE session_id = ${session_id}`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#updateSessionInformation[0]: Database request failed. `, err)
                return [];
            });

        return !result[0] || !result[0].ip || !result[0].continent || !result[0].country || !result[0].region || !result[0].city || !result[0].device || !result[0].platform;
    }

    /**
     * todo
     * @param token
     */
    static async getResetRequest(token: string): Promise<ResetRequest | undefined> {
        const [result] = await SQL`SELECT *
                                   FROM reset_tokens
                                   WHERE token = ${token}`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#getResetRequest[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getResetRequestExpiration(uuid: string): Promise<number> {
        const [result] = await SQL`SELECT expires
                                   FROM reset_tokens
                                   WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#getResetRequestFromUuid[0]: Database request failed. `, err)
                return [];
            });

        return result[0].expires ?? -1;
    }

    /**
     * todo
     * @param uuid
     * @param token
     */
    static async setResetToken(uuid: string, token: string): Promise<void> {
        await SQL`INSERT INTO reset_tokens(uuid, token)
                  VALUES (${uuid}, ${token})
                  ON DUPLICATE KEY UPDATE token   = ${token},
                                          expires = (ADDTIME(CURRENT_TIMESTAMP, "30:0"))`
            .catch((err: any): void => LOGGER.error(`Auth#setResetToken[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async deleteResetToken(uuid: string): Promise<void> {
        await SQL`DELETE
                  FROM reset_tokens
                  WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Auth#deleteResetToken[0]: Database request failed. `, err));
    }
}

export default {Inventories, Items, Users, Auth};