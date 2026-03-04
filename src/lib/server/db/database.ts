import {LOGGER} from "../../../hooks.server";
import {env} from "$env/dynamic/private";
import {randomUUIDv7, SQL} from "bun";
import type {Currency, Inventory, Item, PageTheme, ResetRequest, Session, User} from "$lib/server/db/interfaces";
import currencies from "$lib/server/db/components/currencies";
import colors from "$lib/server/db/components/colors";
import {UserSettings} from "$lib/components/settings/UserSettings";
import type {Setting} from "$lib/components/settings/GenericSettings.svelte";
import {type ApplicationSetting, type ApplicationSettings, defaultSettings, emptyApplicationSettingsObj} from "$lib/server/db/components/ApplicationSettingsDefaults";

const sql: SQL = new SQL({
    adapter: 'mysql',
    max: 10,
    idleTimeout: 60,
    connectionTimeout: 30,
    bigint: true,
    onconnect: (err) => {
        if (err) {
            LOGGER.error(`Failed to connect to database.`, err);
        } else {
            LOGGER.debug('Database connection established.');
        }
    }
});

export function getConnection(): SQL {
    return sql;
}

/**
 * todo
 */
export async function init(): Promise<void> {
    await ensureTables();
    await ensureConstraints();
    await ensureDefaultValues();
}

/**
 * Ensures all tables are present in the database.
 */
async function ensureTables(): Promise<void> {
    LOGGER.debug(`Creating tables...`);

    await sql`CREATE TABLE IF NOT EXISTS application_settings
              (
                  category       VARCHAR(60)          NOT NULL,
                  subcategory    VARCHAR(60)          NOT NULL,
                  setting        VARCHAR(60)          NOT NULL,
                  text_value     VARCHAR(255)         NULL,
                  textarea_value TEXT                 NULL,
                  toggle_value   TINYINT(1) DEFAULT 0 NOT NULL,
                  PRIMARY KEY (category, subcategory, setting)
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'application_settings'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS currencies
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
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'currencies'. `, err));

    /*
   todo: If account of owner is attempted deleted;
    Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
    */
    await sql`CREATE TABLE IF NOT EXISTS inventories
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'inventories'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS inventory_settings
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'inventory_settings'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS users
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'users'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS user_settings
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'user_settings'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS inventory_access
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'inventory_access'. `, err));

    //todo: Expand to allow for custom colors in the future.
    await sql`CREATE TABLE IF NOT EXISTS labels
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'labels'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS default_label_colors
              (
                  id              TINYINT(24) NOT NULL,
                  border          CHAR(9)     NOT NULL,
                  background      CHAR(9)     NOT NULL,
                  dark_border     CHAR(9)     NOT NULL,
                  dark_background CHAR(9)     NOT NULL,
                  PRIMARY KEY (id),
                  CONSTRAINT default_label_colors_id_u
                      UNIQUE (id)
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'default_label_colors'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS items
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'items'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS item_labels
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
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'item_labels'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS sessions
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
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'sessions'. `, err));

    await sql`CREATE TABLE IF NOT EXISTS reset_tokens
              (
                  uuid    CHAR(36)                                               NOT NULL,
                  token   VARCHAR(255)                                           NOT NULL,
                  expires TIMESTAMP DEFAULT (ADDTIME(CURRENT_TIMESTAMP, "15:0")) NOT NULL,
                  PRIMARY KEY (uuid),
                  CONSTRAINT reset_tokens_uuid_fk
                      FOREIGN KEY (uuid) REFERENCES users (uuid)
                          ON DELETE CASCADE
              )`
        .catch((err: Error): void => LOGGER.error(`Failed to create table 'reset_tokens'. `, err));
}

/**
 * Ensures all table constraint are in place. Some constraints are unable to be created when creating the tables,
 * due to cross-references between the tables. If possible, a constraint is defined when the table is created,
 * otherwise the constraint will be created when this method is called.
 */
async function ensureConstraints(): Promise<void> {
    LOGGER.debug(`Creating table constraints...`);

    const constraint = await sql`SELECT CONSTRAINT_NAME as name,
                                        CONSTRAINT_TYPE as type
                                 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                                 WHERE TABLE_SCHEMA = 'inventar'
                                   AND TABLE_NAME = 'inventories'
                                   AND CONSTRAINT_NAME = 'inventories_owner_fk'`;

    if (constraint[0].name !== 'inventories_owner_fk') {
        await sql`ALTER TABLE inventories
            ADD CONSTRAINT inventories_owner_fk
                FOREIGN KEY (owner) REFERENCES users (uuid)`
            .catch((err: Error): [] => {
                LOGGER.error(`Failed to add constraint 'fk_owner' to table 'inventories'. `, err);
                return [];
            });
    }
}

/**
 * Ensures all default values are present in the database.
 */
async function ensureDefaultValues(): Promise<void> {
    LOGGER.debug(`Ensuring default values...`);

    await sql`INSERT IGNORE INTO application_settings ${sql(defaultSettings)}`
        .catch(err => LOGGER.error(`Failed to add default values to table 'application_settings'. `, err as Error))

    for (const row of currencies) {
        await sql`INSERT INTO currencies (id, code, format)
                  VALUES (${row.id}, ${row.code}, ${row.format ?? '%value%'})
                  ON DUPLICATE KEY UPDATE code=${row.code},
                                          format=${row.format ?? '%value%'}`
            .catch(err => LOGGER.error(`Failed to add default values to table 'currencies'. `, err as Error))
    }

    for (const row of colors) {
        await sql`INSERT INTO default_label_colors (id, border, background, dark_border, dark_background)
                  VALUES (${row.id}, ${row.border}, ${row.background}, ${row.dark_border}, ${row.dark_background})
                  ON DUPLICATE KEY UPDATE border=${row.border},
                                          background=${row.background},
                                          dark_border=${row.dark_border},
                                          dark_background=${row.dark_background}`
            .catch(err => LOGGER.error(`Failed to add default values to table 'default_label_colors'. `, err as Error))
    }
}

/**
 * todo
 */
export async function getApplicationSettings(): Promise<ApplicationSettings> {
    const result: ApplicationSetting[] = await sql`SELECT *
                                                   FROM application_settings`
        .catch((err: Error): [] => {
            LOGGER.error(`getApplicationSettings[0]: Database request failed. `, err);
            return [];
        });

    const settings: ApplicationSettings = emptyApplicationSettingsObj;

    for (const row of result) {
        const setting: ApplicationSetting = row;
        if (!setting.category || !setting.subcategory || !setting.setting) continue;

        settings.get(setting.category)?.get(setting.subcategory)?.set(setting.setting, setting);
    }

    return settings;
}

/**
 * todo
 */
export async function getCurrencies(): Promise<Currency[]> {
    return await sql`SELECT *
                     FROM currencies
                     ORDER BY code ASC`
        .catch((err): Currency[] => {
            LOGGER.error(`getCurrencies[0]: Database request failed. `, err as Error)
            return [];
        }) as Currency[];
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
        const uuid: string = randomUUIDv7();

        await sql`INSERT INTO inventories(uuid, owner, name, description)
                  VALUES (${uuid}, ${owner}, ${name}, ${description ?? null})`
            .catch((err: Error): void => LOGGER.error(`Inventories#create[0]: Database request failed. `, err));

        const result: Inventory[] = await sql`SELECT *
                                              FROM inventories
                                              WHERE uuid = ?
                                              LIMIT 1`
            .catch((err: Error): [] => {
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
        const inventories: Inventory[] = await sql`SELECT uuid,
                                                          owner,
                                                          name,
                                                          description,
                                                          last_update,
                                                          created_at
                                                   FROM inventories
                                                   ORDER BY ${order_by === '' ? 'created_at' : order_by} ${order}
                                                   LIMIT ${amount} OFFSET ${offset}`
            .catch((err: Error): [] => {
                LOGGER.error(`Inventories#fetch[0]: Database request failed. `, err)
                return [];
            });

        if (inventories.length !== 0) {
            const itemAmounts = await sql`SELECT COUNT(amount) as item_amount, inventory
                                          FROM items
                                          GROUP BY inventory`
                .catch((err: Error): [] => {
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
        const inventoryCount = await sql`SELECT COUNT(uuid) AS amount
                                         FROM inventories`
            .catch((err: Error): [] => {
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
        const result: Inventory[] = await sql`SELECT *
                                              FROM inventories
                                              WHERE uuid = ${uuid}
                                              LIMIT 1`
            .catch((err: Error): Inventory[] => {
                LOGGER.error(`Inventories#fetchInventoryByUuid[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
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
        const uuid: string = randomUUIDv7();

        await sql`INSERT INTO items (uuid, created_by, inventory, name, description, amount, image, url, price, currency)
                  VALUES (${uuid}, ${created_by}, ${inventory}, ${name}, ${description ?? null}, ${amount}, ${image ?? null}, ${url ?? null}, ${price}, ${currency})`
            .catch((err: Error): void => LOGGER.error(`Items#create[0]: Database request failed. ${err.name}`, err));

        const result: Item[] = await sql`SELECT *
                                         FROM items
                                         WHERE uuid = ${uuid}
                                         LIMIT 1`
            .catch((err: Error): Item[] => {
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
    static async fetch(inventory: string, amount: number = 15, order: string, offset: number = 0, order_by?: string): Promise<Item[]> {
        const result: Item[] = await sql`SELECT items.uuid        as uuid,
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
                                         ORDER BY ${order_by ? order_by : 'created_at'} ${order}
                                         LIMIT ${amount} OFFSET ${offset}`
            .catch((err: Error): Item[] => {
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
        const result: Item[] = await sql`SELECT COUNT(uuid) AS amount
                                         FROM items
                                         WHERE inventory = ${inventory}`
            .catch((err: Error): Item[] => {
                LOGGER.error(`Items#fetchTotalItemCount[0]: Database request failed. `, err)
                return [];
            });

        return result[0].amount ?? 0;
    }

    /**
     * todo
     * @param uuid
     */
    static async deleteItem(uuid: string): Promise<void> {
        await sql`DELETE
                  FROM items
                  WHERE uuid = ${uuid}`
            .catch((err: Error): void => LOGGER.error(`Items#deleteItem[0]: Database request failed. `, err));
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
        const uuid: string = randomUUIDv7();

        await sql`INSERT INTO users (uuid, email, username, password_hash, superuser)
                  VALUES (${uuid}, ${email}, ${username}, ${password_hash}, ${superuser})`
            .catch((err: Error): void => LOGGER.error(`Users#create[0]: Database request failed. `, err));

        const result: User[] = await sql`SELECT *
                                         FROM users
                                         WHERE uuid = ${uuid}
                                         LIMIT 1`
            .catch((err: Error): User[] => {
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
        const result: User[] = await sql`SELECT *
                                         FROM users
                                         WHERE uuid = ${uuid}`
            .catch((err: Error): User[] => {
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
        const result: User[] = await sql`SELECT *
                                         FROM users
                                         WHERE email = ${email}`
            .catch((err: Error): User[] => {
                LOGGER.error(`Users#getFromEmail[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getPasswordHash(uuid: string): Promise<string> {
        const result = await sql`SELECT password_hash
                                 FROM users
                                 WHERE uuid = ${uuid}`
            .catch((err: Error): [] => {
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
        await sql`UPDATE users
                  SET password_hash = ${passwordHash}
                  WHERE uuid = ${uuid}`
            .catch((err: Error): void => LOGGER.error(`Users#setPasswordHash[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async updateLastLogin(uuid: string): Promise<void> {
        await sql`UPDATE users
                  SET last_login = CURRENT_TIMESTAMP
                  WHERE uuid = ${uuid}`
            .catch((err: Error): void => LOGGER.error(`Users#updateLastLogin[0]: Database request failed. `, err));
    }

    /**
     * todo
     */
    static async getUserAmount(): Promise<number> {
        const result = await sql`SELECT count(uuid) as amount
                                 FROM users`
            .catch((err: Error): [] => {
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
        await sql`UPDATE users
                  SET primary_inventory = ${inventory}
                  WHERE uuid = ${uuid}`
            .catch((err: Error): void => LOGGER.error(`Users#setPrimaryInventory[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     * @param theme
     */
    static async updatePreferredTheme(uuid: string, theme: PageTheme): Promise<void> {
        await sql`UPDATE users
                  SET preferred_theme = ${theme}
                  WHERE uuid = ${uuid}`
            .catch((err: Error): void => LOGGER.error(`Users#updatePreferredTheme[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async getSettings(uuid: string): Promise<UserSettings> {
        const settings: UserSettings = new UserSettings(uuid);

        const categories: { category: string, category_order: string | number }[] = await sql`SELECT DISTINCTROW category, category_order
                                                                                              FROM user_settings
                                                                                              WHERE uuid = ${uuid}
                                                                                              ORDER BY category_order`
            .catch((err: Error): [] => {
                LOGGER.error(`Users#getSettings[0]: Database request failed. `, err);
                return [];
            });

        const all_categories: {
            category: string,
            category_order: string | number,
            subcategory: string,
            subcategory_order: string | number
        }[] = await sql`SELECT DISTINCTROW category, category_order, subcategory, subcategory_order
                        FROM user_settings
                        WHERE uuid = ${uuid}
                        ORDER BY category_order, subcategory_order`
            .catch((err: Error): [] => {
                LOGGER.error(`Users#getSettings[1]: Database request failed. `, err);
                return [];
            });

        const setting: Setting[] = await sql`SELECT *
                                             FROM user_settings
                                             WHERE uuid = ${uuid}
                                             ORDER BY category_order, subcategory_order, setting_order`
            .catch((err: Error): Setting[] => {
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
        const result = await sql`SELECT superuser
                                 FROM users
                                 WHERE uuid = ${uuid}`
            .catch((err: Error): [] => {
                LOGGER.error(`Users#isSuperuser[0]: Database request failed. `, err)
                return [];
            });

        return result[0].superuser ?? 0;
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
        await sql`INSERT INTO sessions (uuid, session_id)
                  VALUES (${session.uuid}, ${session.session_id})
                  ON DUPLICATE KEY UPDATE session_id = ${session.session_id},
                                          expires=(ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))`
            .catch((err: Error): void => LOGGER.error(`Auth#newSession[0]: Database request failed. `, err));

        session.expires = await this.getSessionExpiration(session.session_id);
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session | undefined> {
        const result: Session[] = await sql`SELECT *
                                            FROM sessions
                                            WHERE session_id = ${session_id}`
            .catch((err: Error): Session[] => {
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
        const results = await sql`SELECT *
                                  FROM sessions
                                  WHERE uuid = ${uuid}
                                  ORDER BY last_accessed`
            .catch((err: Error): [] => {
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
     * @param session The session to renew.
     */
    static async renewSession(session: Session): Promise<void> {
        await sql`UPDATE sessions
                  SET expires = (ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))
                  WHERE session_id = ${session.session_id}`
            .catch((err: Error): void => LOGGER.error(`Auth#renewSession[0]: Database request failed. `, err));

        session.expires = await this.getSessionExpiration(session.session_id);
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        await sql`DELETE
                  FROM sessions
                  WHERE session_id = ${session_id}`
            .catch((err: Error): void => LOGGER.error(`Auth#invalidateSession[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async getSessionExpiration(session_id: string): Promise<number> {
        const results = await sql`SELECT expires
                                  FROM sessions
                                  WHERE session_id = ${session_id}`
            .catch((err: Error): [] => {
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
        await sql`UPDATE sessions
                  SET last_accessed = CURRENT_TIMESTAMP
                  WHERE session_id = ${session_id}`
            .catch((err: Error): void => LOGGER.error(`Auth#updateLastAccess[0]: Database request failed. `, err));
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
        await sql`UPDATE sessions
                  SET ip        = ${data.query ?? null},
                      continent = ${data.continent ?? null},
                      country   = ${data.country ?? null},
                      region    = ${data.regionName ?? null},
                      city      = ${data.city ?? null},
                      device    = ${data.device ?? null},
                      platform  = ${data.platform ?? null}
                  WHERE session_id = ${session_id}`
            .catch((err: Error): void => LOGGER.error(`Auth#updateSessionInformation[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async isSessionInformationMissing(session_id: string): Promise<boolean> {
        const [result] = await sql`SELECT ip, continent, country, region, city, device, platform
                                   FROM sessions
                                   WHERE session_id = ${session_id}`
            .catch((err: Error): [] => {
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
        const result = await sql`SELECT *
                                 FROM reset_tokens
                                 WHERE token = ${token}`
            .catch((err: Error): [] => {
                LOGGER.error(`Auth#getResetRequest[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     */
    static async getResetRequestFromUuid(uuid: string): Promise<ResetRequest | undefined> {
        const result: ResetRequest[] = await sql`SELECT *
                                                 FROM reset_tokens
                                                 WHERE uuid = ${uuid}`
            .catch((err: Error): ResetRequest[] => {
                LOGGER.error(`Auth#getResetRequestFromUuid[0]: Database request failed. `, err)
                return [];
            });

        return result[0] ?? undefined;
    }

    /**
     * todo
     * @param uuid
     * @param token
     */
    static async setResetToken(uuid: string, token: string): Promise<void> {
        await sql`INSERT INTO reset_tokens(uuid, token)
                  VALUES (${uuid}, ${token})
                  ON DUPLICATE KEY UPDATE token   = ${token},
                                          expires = (ADDTIME(CURRENT_TIMESTAMP, "30:0"))`
            .catch((err: Error): void => LOGGER.error(`Auth#setResetToken[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param token
     */
    static async deleteResetToken(token: string): Promise<void> {
        await sql`DELETE
                  FROM reset_tokens
                  WHERE token = ${token}`
            .catch((err: Error): void => LOGGER.error(`Auth#deleteResetToken[0]: Database request failed. `, err));
    }
}

export default {Inventories, Items, Users, Auth};