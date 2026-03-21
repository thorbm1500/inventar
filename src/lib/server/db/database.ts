// noinspection DuplicatedCode

import {LOGGER} from "../../../hooks.server";
import type {Inventory, PageTheme, ResetRequest, Session, User} from "$lib/server/db/interfaces";
import {UserSettings} from "$lib/components/settings/UserSettings";
import type {Setting} from "$lib/components/settings/GenericSettings.svelte";
import {faker} from "@faker-js/faker/locale/en";
import {env} from "$env/dynamic/private";
import {Audit} from "$lib/server/db/components/audit";
import {Redis, type RedisKey} from "$lib/server/db/redis";
import {Items} from "$lib/server/db/components/item";
import {Labels} from "$lib/server/db/components/labels";
import {SimpleFaker} from "@faker-js/faker";

export class Database {
    // noinspection JSUnusedGlobalSymbols
    static readonly SQL: Bun.SQL = new Bun.SQL({
        adapter: 'mysql',
        max: 5,
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

    /**
     * This method initializes the database, ensuring all tables,
     * and their default values are present, as well as all constraints for each table.
     * This method is called one, during the server load, at startup.
     */
    static async init(): Promise<void> {
        await LOGGER.timed('Initializing database...', 'Database initialization completed.', async (): Promise<void> => {
            // noinspection ES6MissingAwait
            Redis.init();

            await this.ensureTables();
            await this.ensureConstraints();
            await this.ensureDefaultValues();
        });
    }

    static async shutdown(): Promise<void> {
        Redis.shutdown();
        LOGGER.debug(`Flushing potential pending database operations...`);
        Database.SQL.flush();
        await Database.SQL.close();
    }

    /**
     * Ensures all tables are present in the database.
     */
    private static async ensureTables(): Promise<void> {
        LOGGER.debug(`Creating tables...`);
        await Database.SQL`CREATE TABLE IF NOT EXISTS audit
                           (
                               id        INT AUTO_INCREMENT PRIMARY KEY,
                               actor     VARCHAR(36)                         NOT NULL,
                               target    VARCHAR(36)                         NOT NULL,
                               event     VARCHAR(64)                         NOT NULL,
                               message   TEXT                                NOT NULL,
                               timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                           )`
            .catch((err: any): void => LOGGER.error(`Failed to create table 'audit'. `, err));

        /*
       todo: If account of owner is attempted deleted;
        Check for other members with access, prompt if inventory should be deleted, or transferred. If not other accounts has access, delete inventory.
        */
        await Database.SQL`CREATE TABLE IF NOT EXISTS inventories
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

        await Database.SQL`CREATE TABLE IF NOT EXISTS users
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

        await Database.SQL`CREATE TABLE IF NOT EXISTS items
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
                               unit_type           VARCHAR(64)                              NOT NULL,
                               unit                VARCHAR(64)                              NOT NULL,
                               image               TEXT                                     NULL,
                               url                 TEXT                                     NULL,
                               price               DECIMAL(50, 2) DEFAULT 0.00              NOT NULL,
                               currency            CHAR(3)        DEFAULT 'N/A'             NOT NULL,
                               currency_format     VARCHAR(32)    DEFAULT '%value%'         NOT NULL,
                               created_by          CHAR(36)                                 NOT NULL,
                               last_update         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
                               created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               PRIMARY KEY (inventory, uuid),
                               CONSTRAINT items_uuid_u
                                   UNIQUE (uuid),
                               CONSTRAINT items_inventory_fk
                                   FOREIGN KEY (inventory) REFERENCES inventories (uuid)
                                       ON DELETE CASCADE,
                               CONSTRAINT items_created_by_fk
                                   FOREIGN KEY (created_by) REFERENCES users (uuid)
                           )`
            .catch((err: any): void => LOGGER.error(`Failed to create table 'items'. `, err));

        await Database.SQL`CREATE TABLE IF NOT EXISTS labels
                           (
                               uuid      CHAR(36)    NOT NULL,
                               inventory CHAR(36)    NOT NULL,
                               name      VARCHAR(24) NOT NULL,
                               color     VARCHAR(24) NOT NULL,
                               PRIMARY KEY (uuid),
                               CONSTRAINT labels_inventory_fk
                                   FOREIGN KEY (inventory) REFERENCES inventories (uuid) ON DELETE CASCADE
                           )`

        await Database.SQL`CREATE TABLE IF NOT EXISTS item_labels
                           (
                               item  CHAR(36) NOT NULL,
                               label CHAR(36) NOT NULL,
                               PRIMARY KEY (item, label),
                               CONSTRAINT item_labels_item_fk
                                   FOREIGN KEY (item) REFERENCES items (uuid) ON DELETE CASCADE,
                               CONSTRAINT item_labels_label_fk
                                   FOREIGN KEY (label) REFERENCES labels (uuid) ON DELETE CASCADE
                           )`

        await Database.SQL`CREATE TABLE IF NOT EXISTS sessions
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

        await Database.SQL`CREATE TABLE IF NOT EXISTS reset_tokens
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
    private static async ensureConstraints(): Promise<void> {
        LOGGER.debug(`Creating table constraints...`);

        const constraint = await Database.SQL`SELECT CONSTRAINT_NAME as name,
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
            await Database.SQL`ALTER TABLE inventories
                ADD CONSTRAINT inventories_owner_fk
                    FOREIGN KEY (owner) REFERENCES users (uuid)`
                .catch((err: any): void => LOGGER.error(`Failed to add constraint 'fk_owner' to table 'inventories'. `, err));
        }
    }

    /**
     * Ensures all default values are present in the database.
     */
    private static async ensureDefaultValues(): Promise<void> {
        LOGGER.debug(`Ensuring default values...`);

        if (env.NODE_ENV !== 'production') {
            await Database.SQL`INSERT IGNORE INTO inventories(uuid, owner, name)
                               VALUES ('devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'devxuser-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Development')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxxgreen', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Refurbished','green')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxxxblue', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Remote','blue')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxpurple', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Development','purple')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxxxpink', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'New','pink')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxyellow', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Reserved','yellow')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxorange', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Spare','orange')`;
            await Database.SQL`INSERT IGNORE INTO labels VALUES ('devlabel-xxxx-xxxx-xxxx-xxxxxxxxred', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'Broken','red')`;


            await Database.SQL`INSERT IGNORE INTO users(uuid, email, password_hash, username, superuser)
                               VALUES ('devxuser-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'development@inventar.dev', 'none', 'development', 1)`;

            const result: number = await Items.fetchTotalItemCount('devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx');

            const getRandomLabel = () => faker.helpers.arrayElement(['devlabel-xxxx-xxxx-xxxx-xxxxxxgreen','devlabel-xxxx-xxxx-xxxx-xxxxxxxblue','devlabel-xxxx-xxxx-xxxx-xxxxxpurple','devlabel-xxxx-xxxx-xxxx-xxxxxxxpink','devlabel-xxxx-xxxx-xxxx-xxxxxyellow','devlabel-xxxx-xxxx-xxxx-xxxxxorange','devlabel-xxxx-xxxx-xxxx-xxxxxxxxred']);

            for (let i: number = result; i < 250; i++) {
                let labels: string[] = [];
                if (Math.random() > 0.35) {
                    for (let i = 0; i < faker.number.int({min: 0, max: 5}); i++) {
                        labels.push(getRandomLabel());
                    }
                }

                await Items.create('devxuser-xxxx-xxxx-xxxx-xxxxxxxxxxx', 'devxinvx-xxxx-xxxx-xxxx-xxxxxxxxxxx', faker.commerce.productName(), Math.random() > .45 ? faker.number.int({
                    min: 0,
                    max: 1000000
                }) : 0, {price: Math.random() > .45 ? Number.parseFloat(faker.commerce.price({min: 0, max: 10000, dec: 2})) : 0, labels});
            }
        }
    }
}

/**
 * A Helper class for dealing with Application related database tasks.
 */
export class Application {
    static async updateRegistrationToken(token: string, uuid: string): Promise<void> {
        await Database.SQL`UPDATE application_settings
                           SET text_value=${token}
                           WHERE category = 'security'
                             AND subcategory = 'general'
                             AND setting = 'registration_token'`
            .then((): Promise<void> => Audit.user(uuid, 'System', 'Modification', `Registration token updated`));
    }
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

        await Database.SQL`INSERT INTO inventories(uuid, owner, name, description)
                           VALUES (${uuid}, ${owner}, ${name}, ${description ?? null})`
            .then((): void => {
                Audit.user(owner, uuid, 'Creation', `Inventory created`);
                Redis.increment(`inventory:total_amount`);
            })
            .catch((err: any): void => LOGGER.error(`Inventories#create[0]: Database request failed. `, err));

        return this.fetchInventoryByUuid(uuid);
    }

    /**
     * todo
     * @param amount
     * @param order_by
     * @param order
     * @param offset
     */
    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<Inventory[]> {
        //todo: Add caching in Redis
        const inventories: Inventory[] = await Database.SQL`SELECT uuid,
                                                                   owner,
                                                                   name,
                                                                   description,
                                                                   last_update,
                                                                   created_at
                                                            FROM inventories
                                                            ORDER BY ${Database.SQL(order_by === '' ? 'created_at' : order_by) + ' ' + order}
                                                            LIMIT ${amount} OFFSET ${offset}`
            .catch((err: any): [] => {
                LOGGER.error(`Inventories#fetch[0]: Database request failed. `, err)
                return [];
            });

        if (inventories.length !== 0) {
            const itemAmounts = await Database.SQL`SELECT COUNT(amount) as item_amount, inventory
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
        const redisKey: RedisKey = `inventory:total_amount`;

        if (await Redis.has(redisKey)) {
            return await Redis.getAsNumber(redisKey);
        } else {
            const inventoryCount: any = await Database.SQL`SELECT COUNT(uuid) AS amount
                                                           FROM inventories`
                .catch((err: any): [] => {
                    LOGGER.error(`Inventories#fetchTotalInventoryCount[0]: Database request failed. `, err)
                    return [];
                });

            const count: any = inventoryCount[0].amount ?? null;
            if (count === null) return 0;

            // noinspection ES6MissingAwait
            Redis.set(redisKey, count, 60);

            return count;
        }
    }

    /**
     * todo
     * @param uuid
     */
    static async fetchInventoryByUuid(uuid: string): Promise<Inventory | undefined> {
        const redisKey: RedisKey = `inventory:${uuid}`;

        if (await Redis.has(redisKey)) {
            const inventory: Inventory = await Redis.getObj(redisKey) as Inventory;

            inventory.created_at = Number.parseInt(String(inventory.created_at));
            inventory.last_update = Number.parseInt(String(inventory.last_update));

            return inventory;
        } else {
            const inventory: Inventory | undefined = (await Database.SQL`SELECT *
                                                                         FROM inventories
                                                                         WHERE uuid = ${uuid}
                                                                         LIMIT 1`
                .catch((err: any): Inventory[] => {
                    LOGGER.error(`Inventories#fetchInventoryByUuid[0]: Database request failed. `, err)
                    return [];
                }))[0] ?? undefined;

            if (!inventory) return undefined;

            inventory.created_at = Date.parse(String(inventory.created_at));
            inventory.last_update = Date.parse(String(inventory.last_update));

            // noinspection ES6MissingAwait
            Redis.setObj(redisKey, inventory);

            inventory.labels = await Labels.getLabelsForInventory(uuid);

            return inventory;
        }
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

        await Database.SQL`INSERT INTO users (uuid, email, username, password_hash, superuser)
                           VALUES (${uuid}, ${email}, ${username}, ${password_hash}, ${superuser})`
            .then((): Promise<void> => Audit.system(uuid, 'Creation', `New user created.`))
            .catch((err: any): void => LOGGER.error(`Users#create[0]: Database request failed. `, err));

        // noinspection ES6MissingAwait
        Redis.increment(`users:amount`);

        return this.getFromUuid(uuid);
    }

    /**
     * todo
     * @param uuid
     */
    static async getFromUuid(uuid: string): Promise<User | undefined> {
        const redisKey: RedisKey = `user:${uuid}`;

        if (await Redis.has(redisKey)) {
            const redisObj = await Redis.getObj(redisKey) as User;
            if (!redisObj) return undefined;

            const user = redisObj as User;
            user.created_at = Number.parseInt(String(user.created_at));

            return user;
        } else {
            const result: User[] = await Database.SQL`SELECT *
                                                      FROM users
                                                      WHERE uuid = ${uuid}`
                .catch((err: any): User[] => {
                    LOGGER.error(`Users#getFromUuid[0]: Database request failed. `, err)
                    return [];
                });

            const user: User | undefined = result[0] ?? undefined;
            if (!user) {
                LOGGER.error(`Users#getFromUuid[0]: No user found with uuid '${uuid}'`);
                return undefined;
            }

            user.created_at = Date.parse(String(user.created_at));

            // noinspection ES6MissingAwait
            Redis.setObj(redisKey, user);

            return user;
        }
    }

    /**
     * todo
     * @param email
     */
    static async getFromEmail(email: string): Promise<User | undefined> {
        const uuid: string | null = await this.getUuidFromEmail(email);
        if (uuid === null) return undefined;

        return await this.getFromUuid(uuid);
    }

    static async getUuidFromEmail(email: string): Promise<string | null> {
        const redisKey: RedisKey = `user:${email}`;

        if (await Redis.has(redisKey)) {
            return await Redis.get(redisKey);
        } else {
            const result: any = await Database.SQL`SELECT uuid
                                                   FROM users
                                                   WHERE email = ${email}`
                .catch((err: any): User[] => {
                    LOGGER.error(`Users#getUuidFromEmail[0]: Database request failed. `, err)
                    return [];
                });

            const uuid: any = result[0].uuid ?? null;
            if (uuid === null) return null;

            // noinspection ES6MissingAwait
            Redis.set(redisKey, uuid);

            return uuid;
        }
    }

    static async getUuidFromUsername(username: string): Promise<string | null> {
        const redisKey: RedisKey = `user:${username}:uuid`;

        if (await Redis.has(redisKey)) {
            return await Redis.get(redisKey);
        } else {
            const result: any = await Database.SQL`SELECT uuid
                                                   FROM users
                                                   WHERE username = ${username}`
                .catch((err: any): User[] => {
                    LOGGER.error(`Users#getUuidFromUsername[0]: Database request failed. `, err)
                    return [];
                });

            const uuid: any = result[0].uuid ?? null;
            if (!uuid) return null;

            // noinspection ES6MissingAwait
            Redis.set(redisKey, uuid, 3600);

            return uuid;
        }
    }

    /**
     * todo
     * @param uuid
     */
    static async getPasswordHash(uuid: string): Promise<string> {
        const result: any = await Database.SQL`SELECT password_hash
                                               FROM users
                                               WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getPasswordHash[0]: Database request failed. `, err)
                return [];
            });

        const hash: any = result[0].password_hash ?? '';

        return hash;
    }

    /**
     * todo
     * @param uuid
     * @param passwordHash
     */
    static async setPasswordHash(uuid: string, passwordHash: string): Promise<void> {
        await Database.SQL`UPDATE users
                           SET password_hash = ${passwordHash}
                           WHERE uuid = ${uuid}`
            .then((): Promise<void> => Audit.user(uuid, uuid, 'Modification', `Updated password hash`))
            .catch((err: any): void => LOGGER.error(`Users#setPasswordHash[0]: Database request failed. `, err));
    }

    /**
     * todo
     */
    static async getUserAmount(): Promise<number> {
        const redisKey: RedisKey = `users:amount`;

        if (await Redis.has(redisKey)) {
            return await Redis.getAsNumber(redisKey);
        } else {
            const result: any = await Database.SQL`SELECT count(uuid) as amount
                                                   FROM users`
                .catch((err: any): [] => {
                    LOGGER.error(`Users#getUserAmount[0]: Database request failed. `, err)
                    return [];
                });

            const amount: any = result[0].amount ?? 1;

            // noinspection ES6MissingAwait
            Redis.set(redisKey, amount, 300);

            return amount;
        }
    }

    /**
     * todo
     * @param uuid
     * @param inventory
     */
    static async updatePrimaryInventory(uuid: string, inventory: string | null): Promise<void> {
        await Database.SQL`UPDATE users
                           SET primary_inventory = ${inventory}
                           WHERE uuid = ${uuid}`
            .catch((err: any): void => LOGGER.error(`Users#setPrimaryInventory[0]: Database request failed. `, err));
        Redis.del(`user:${uuid}`);
    }

    /**
     * todo
     * @param uuid
     * @param theme
     */
    static async updatePreferredTheme(uuid: string, theme: PageTheme): Promise<void> {
        await Database.SQL`UPDATE users
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

        const categories: { category: string, category_order: string | number }[] = await Database.SQL`SELECT DISTINCTROW category, category_order
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
        }[] = await Database.SQL`SELECT DISTINCTROW category, category_order, subcategory, subcategory_order
                                 FROM user_settings
                                 WHERE uuid = ${uuid}
                                 ORDER BY category_order, subcategory_order`
            .catch((err: any): [] => {
                LOGGER.error(`Users#getSettings[1]: Database request failed. `, err);
                return [];
            });

        const setting: Setting[] = await Database.SQL`SELECT *
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
        const redisKey: RedisKey = `user:${uuid}:superuser`;

        if (await Redis.has(redisKey)) {
            return await Redis.get(redisKey) === 'true';
        } else {
            const result: any = await Database.SQL`SELECT superuser
                                                   FROM users
                                                   WHERE uuid = ${uuid}`
                .catch((err: any): [] => {
                    LOGGER.error(`Users#isSuperuser[0]: Database request failed. `, err)
                    return [];
                });

            const superuser: any = result[0].superuser ?? 0;

            await Redis.set(redisKey, superuser ? 'true' : 'false', 3600);

            return superuser;
        }
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
        await Database.SQL`INSERT INTO sessions (uuid, session_id)
                           VALUES (${uuid}, ${session_id})
                           ON DUPLICATE KEY UPDATE session_id = ${session_id},
                                                   expires=(addtime(now(), _utf8mb4'7 0:0'))`
            .then((): Promise<void> => Audit.system(uuid, 'Creation', `Created new Session with ID '${session_id}'`))
            .catch((err: any): void => LOGGER.error(`Auth#newSession[0]: Database request failed. `, err));
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<Session | undefined> {
        const redisKey: RedisKey = `session:${session_id}`;

        if (await Redis.has(redisKey)) {
            const session = await Redis.getObj(redisKey) as Session;

            session.expires = Number.parseInt(String(session.expires));
            session.last_accessed = Number.parseInt(String(session.last_accessed));
            session.created_at = Number.parseInt(String(session.created_at));

            return session;
        } else {
            const session: Session | undefined = (await Database.SQL`SELECT *
                                                                     FROM sessions
                                                                     WHERE session_id = ${session_id}`
                .catch((err: any): Session[] => {
                    LOGGER.error(`Auth#getSession[0]: Database request failed. `, err)
                    return [];
                }))[0] ?? undefined;

            if (!session) return undefined;

            session.expires = Date.parse(String(session.expires));
            session.last_accessed = Date.parse(String(session.last_accessed));
            session.created_at = Date.parse(String(session.created_at));

            // noinspection ES6MissingAwait
            Redis.setObj(redisKey, session, 300);

            return session;
        }
    }

    /**
     * Gets all existing session.
     * @param uuid UUID of the user.
     */
    static async getSessions(uuid: string): Promise<Session[]> {
        const results = await Database.SQL`SELECT *
                                           FROM sessions
                                           WHERE uuid = ${uuid}
                                           ORDER BY last_accessed`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#getSessions[0]: Database request failed. `, err)
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
        await Database.SQL`UPDATE sessions
                           SET expires = (ADDTIME(CURRENT_TIMESTAMP, "7 0:0"))
                           WHERE session_id = ${session_id}`
            .then((): Promise<void> => Audit.system('User', 'Modification', `Renewed Session with ID '${session_id}'`))
            .catch((err: any): void => LOGGER.error(`Auth#renewSession[0]: Database request failed. `, err));
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<void> {
        await Database.SQL`DELETE
                           FROM sessions
                           WHERE session_id = ${session_id}`
            .then((): Promise<void> => Audit.system('User', 'Removal', `Invalidated Session with ID '${session_id}'`))
            .catch((err: any): void => LOGGER.error(`Auth#invalidateSession[0]: Database request failed. `, err));

        // noinspection ES6MissingAwait
        Redis.del(`session:${session_id}`);
    }

    /**
     * todo
     * @param session_id
     */
    static async updateLastAccess(session_id: string): Promise<void> {
        await Database.SQL`UPDATE sessions
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
        await Database.SQL`UPDATE sessions
                           SET ip        = ${data.query ?? null},
                               continent = ${data.continent ?? null},
                               country   = ${data.country ?? null},
                               region    = ${data.regionName ?? null},
                               city      = ${data.city ?? null},
                               device    = ${data.device ?? null},
                               platform  = ${data.platform ?? null}
                           WHERE session_id = ${session_id}`
            .then((): Promise<void> => Audit.system('User', 'Modification', `Updated Session information for Session with ID '${session_id}'`))
            .catch((err: any): void => LOGGER.error(`Auth#updateSessionInformation[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param session_id
     */
    static async isSessionInformationMissing(session_id: string): Promise<boolean> {
        const result: any = await Database.SQL`SELECT ip, continent, country, region, city, device, platform
                                               FROM sessions
                                               WHERE session_id = ${session_id}`
            .catch((err: any): [] => {
                LOGGER.error(`Auth#isSessionInformationMissing[0]: Database request failed. `, err)
                return [];
            });

        return !result[0] || !result[0].ip || !result[0].continent || !result[0].country || !result[0].region || !result[0].city || !result[0].device || !result[0].platform;
    }

    /**
     * todo
     * @param token
     */
    static async getResetRequest(token: string): Promise<ResetRequest | undefined> {
        const redisKey: RedisKey = `reset:request:${token}`;

        if (await Redis.has(redisKey)) {
            const request = await Redis.getObj(redisKey) as ResetRequest;
            request.expires = Number.parseInt(String(request.expires));
            return request;
        } else {
            const request: ResetRequest = (await Database.SQL`SELECT *
                                                              FROM reset_tokens
                                                              WHERE token = ${token}
                                                              LIMIT 1`
                .then((res: any): ResetRequest[] => {
                    Audit.system('User', 'System', `Reset Request retrieved from token '${token}'`);
                    return res;
                })
                .catch((err: any): ResetRequest[] => {
                    LOGGER.error(`Auth#getResetRequest[0]: Database request failed. `, err)
                    return [];
                }))[0] ?? undefined;

            if (!request) return undefined;

            request.expires = Date.parse(String(request.expires));

            // noinspection ES6MissingAwait
            await Redis.setObj(redisKey, request);

            return request;
        }
    }

    /**
     * todo
     * @param uuid
     */
    static async getResetRequestExpiration(uuid: string): Promise<number> {
        const redisKey: RedisKey = `reset:request:expiration:${uuid}`;

        if (await Redis.has(redisKey)) {
            return await Redis.getAsNumber(redisKey);
        } else {
            const result = await Database.SQL`SELECT expires
                                              FROM reset_tokens
                                              WHERE uuid = ${uuid}
                                              LIMIT 1`
                .catch((err: any): any[] => {
                    LOGGER.error(`Auth#getResetRequestExpiration[0]: Database request failed. `, err)
                    return [];
                });

            const expiration: any = result[0].expires ?? -1;


            if (expiration > -1) {
                // noinspection ES6MissingAwait
                Redis.set(redisKey, expiration, 30);
            }

            return expiration;
        }
    }

    /**
     * todo
     * @param uuid
     * @param token
     */
    static async setResetToken(uuid: string, token: string): Promise<void> {
        await Database.SQL`INSERT INTO reset_tokens(uuid, token)
                           VALUES (${uuid}, ${token})
                           ON DUPLICATE KEY UPDATE token   = ${token},
                                                   expires = (ADDTIME(CURRENT_TIMESTAMP, "30:0"))`
            .then((): Promise<void> => Audit.system(uuid, 'Creation', 'Reset token created'))
            .catch((err: any): void => LOGGER.error(`Auth#setResetToken[0]: Database request failed. `, err));
    }

    /**
     * todo
     * @param uuid
     */
    static async deleteResetToken(uuid: string): Promise<void> {
        await Database.SQL`DELETE
                           FROM reset_tokens
                           WHERE uuid = ${uuid}`
            .then((): Promise<void> => Audit.system(uuid, 'Removal', 'Reset token removed'))
            .catch((err: any): void => LOGGER.error(`Auth#deleteResetToken[0]: Database request failed. `, err));
    }
}